import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { useSession } from '../../lib/useSession';
import { addGoal, getMatch, getOverview, getPlayers, updateMatchResult, updateMatchStatus } from '../../services/competitionService';

export default function MatchEditorPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const { isAuthenticated, token, user } = useSession();
  const isReady = typeof matchId === 'string';
  const canViewMatch = isAuthenticated && user?.role !== 'GUEST';

  const { data: overview } = useSWR(canViewMatch ? ['match-overview-public'] : null, () => getOverview());
  const { data: match, mutate: mutateMatch } = useSWR(canViewMatch && isReady ? ['match-public', matchId] : null, () => getMatch(matchId as string));
  const { data: homePlayers } = useSWR(canViewMatch && match?.homeTeamId ? ['players-home-public', match.homeTeamId] : null, () => getPlayers(match!.homeTeamId as string));
  const { data: awayPlayers } = useSWR(canViewMatch && match?.awayTeamId ? ['players-away-public', match.awayTeamId] : null, () => getPlayers(match!.awayTeamId as string));

  const [status, setStatus] = useState('PLANNED');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [homeGoalPlayerId, setHomeGoalPlayerId] = useState('');
  const [awayGoalPlayerId, setAwayGoalPlayerId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [goalMessages, setGoalMessages] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setHomeScore(match.homeScore?.toString() ?? '');
      setAwayScore(match.awayScore?.toString() ?? '');
    }
  }, [match]);

  const availablePlayers = useMemo(() => {
    const players = [...(homePlayers ?? []), ...(awayPlayers ?? [])];
    return players.filter((player) => player.status === 'AVAILABLE');
  }, [awayPlayers, homePlayers]);

  const homeAvailablePlayers = useMemo(
    () => availablePlayers.filter((player) => player.teamId === match?.homeTeamId),
    [availablePlayers, match?.homeTeamId],
  );
  const awayAvailablePlayers = useMemo(
    () => availablePlayers.filter((player) => player.teamId === match?.awayTeamId),
    [availablePlayers, match?.awayTeamId],
  );

  if (!canViewMatch) {
    return (
      <section className="heroCard">
        <p className="eyebrow">Match Details</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as a user to view match details and editing tools.</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">Go to login</Link>
          <Link href="/register" className="linkButton">Go to register</Link>
        </div>
      </section>
    );
  }

  if (!isReady) {
    return <p className="muted">Loading match details...</p>;
  }

  if (!match || !overview) {
    return <p className="muted">Loading match details...</p>;
  }

  const homeTeam = overview.teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = overview.teams.find((team) => team.id === match.awayTeamId);
  const overviewMatch = overview.matches.find((item) => item.id === match.id);
  const isAdmin = user?.role === 'ADMIN';
  const isAssignedReferee = user?.role === 'REFEREE' && (match.refereeId === user?.id || overviewMatch?.refereeId === user?.id);
  const canEdit = isAdmin || isAssignedReferee;
  const isRefereeEditor = isAssignedReferee && !isAdmin;
  const hasPlayableTeams = !!match.homeTeamId && !!match.awayTeamId;
  const roundName = overview.rounds.find((round) => round.id === match.roundId)?.name ?? 'Round';
  const dateLabel = new Date(match.matchDate).toLocaleString();
  const statusLabel = getMatchStatusLabel(match.status);
  const canRefereeSetInProgress = hasPlayableTeams && (match.status === 'PLANNED' || match.status === 'NOT_STARTED');
  const canRefereeSetFinished = hasPlayableTeams && match.status === 'IN_PROGRESS';
  const scorerRows = match.goals ?? [];

  const changeRefereeStatus = async (nextStatus: 'IN_PROGRESS' | 'FINISHED') => {
    if (!token) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setMessage(null);
      await updateMatchStatus(match.id, nextStatus, token);
      setMessage(`Match status updated to ${getMatchStatusLabel(nextStatus)}.`);
      await mutateMatch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update match status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const registerGoalForTeam = async (teamId: string | null, playerId: string, clearSelection: () => void) => {
    if (!token || !teamId || !playerId) {
      return;
    }

    const scorer = availablePlayers.find((player) => player.id === playerId);

    if (!scorer) {
      return;
    }

    await addGoal(match.id, {
      playerId,
      teamId,
    }, token);

    const scorerName = `${scorer.firstName} ${scorer.lastName}`;
    const scoringTeamName = teamId === match.homeTeamId
      ? (homeTeam?.name ?? 'Home team')
      : (awayTeam?.name ?? 'Away team');

    setGoalMessages((current) => [`Goal saved: ${scorerName} (${scoringTeamName}).`, ...current].slice(0, 4));
    clearSelection();
    await mutateMatch();
  };

  return (
    <div className="matchEditorLayout">
      <section className="panelCard matchOverviewCard stack">
        <p className="eyebrow">Match Details & Info</p>
        <h2>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'Home'} vs {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'Away'}</h2>
        <div className="matchInfoSplit">
          <div className="matchInfoBlock">
            <h4>Pre-game info</h4>
            <div className="matchMetaGrid">
              <article className="matchMetaItem">
                <p className="matchMetaLabel">Round</p>
                <p className="matchMetaValue">{roundName}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">Date</p>
                <p className="matchMetaValue">{dateLabel}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">Referee</p>
                <p className="matchMetaValue">{overviewMatch?.refereeName ?? 'Unassigned'}</p>
              </article>
            </div>
          </div>

          <div className="matchInfoBlock">
            <h4>Match details</h4>
            <div className="matchMetaGrid">
              <article className="matchMetaItem">
                <p className="matchMetaLabel">Status</p>
                <p className="matchMetaValue">{statusLabel}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">Current score</p>
                <p className="matchMetaValue">{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
              </article>
            </div>
            <div className="scorerListCard">
              <p className="matchMetaLabel">Players who scored</p>
              {scorerRows.length === 0 ? (
                <p className="muted">No goals recorded yet.</p>
              ) : (
                <ul className="scorerList">
                  {scorerRows.map((goal, index) => (
                    <li key={goal.id}>
                      <span>{index + 1}. {goal.teamCountryFlag} {goal.playerName}</span>
                      <small>{goal.teamName}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {!hasPlayableTeams && <p className="muted">Teams are not assigned to this match yet.</p>}
      </section>

      {canEdit && (
        <section className="panelCard matchOverviewCard stack">
          <p className="eyebrow">Edit Match</p>
          <h3>Match status and score</h3>
          <p className="muted">Only admins and the assigned referee can update this match.</p>
          <hr className="matchSectionDivider" />
          <div className="matchEditBlock">
            <div className="matchEditHeader">
              <h4>Edit match status</h4>
            </div>
            {isRefereeEditor ? (
              <div className="rowButtons statusActionRow">
                <button
                  className="smallButton"
                  disabled={!canRefereeSetInProgress || isUpdatingStatus}
                  onClick={async () => {
                    await changeRefereeStatus('IN_PROGRESS');
                  }}
                >
                  Set In Progress
                </button>
                <button
                  className="smallButton"
                  disabled={!canRefereeSetFinished || isUpdatingStatus}
                  onClick={async () => {
                    await changeRefereeStatus('FINISHED');
                  }}
                >
                  Set Finished
                </button>
              </div>
            ) : (
              <>
                <div className="formGrid">
                  <label>
                    Match status
                    <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!hasPlayableTeams}>
                      <option value="PLANNED">PLANNED</option>
                      <option value="NOT_STARTED">NOT_STARTED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="FINISHED">FINISHED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </label>
                  <label>
                    Home score
                    <input type="number" min={0} value={homeScore} onChange={(event) => setHomeScore(event.target.value)} disabled={!hasPlayableTeams} />
                  </label>
                  <label>
                    Away score
                    <input type="number" min={0} value={awayScore} onChange={(event) => setAwayScore(event.target.value)} disabled={!hasPlayableTeams} />
                  </label>
                </div>
                <div className="rowButtons">
                  <button
                    className="smallButton"
                    disabled={!hasPlayableTeams}
                    onClick={async () => {
                      if (!token) return;
                      setMessage(null);
                      await updateMatchStatus(match.id, status as 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED', token);
                      if (homeScore !== '' && awayScore !== '') {
                        await updateMatchResult(match.id, Number(homeScore), Number(awayScore), token);
                      }
                      setMessage('Match updated successfully.');
                      await mutateMatch();
                    }}
                  >
                    Save match
                  </button>
                </div>
              </>
            )}
            {message && <p className="muted">{message}</p>}
          </div>

          <hr className="matchSectionDivider" />
          <div className="matchEditBlock">
            <div className="matchEditHeader">
              <h4>Record goal scorer</h4>
              <p className="muted">Left is home team, right is away team. Pick player and save goal.</p>
            </div>
            <div className="goalSplitGrid">
              <article className="goalTeamCard">
                <div className="goalTeamHeader">
                  <h5>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'Home team'}</h5>
                  <p className="goalTeamScore">Score: {match.homeScore ?? 0}</p>
                </div>
                <label>
                  Home players
                  <select
                    value={homeGoalPlayerId}
                    onChange={(event) => setHomeGoalPlayerId(event.target.value)}
                    disabled={!hasPlayableTeams}
                  >
                    <option value="">Select player</option>
                    {homeAvailablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} #{player.shirtNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="smallButton"
                  disabled={!hasPlayableTeams || !homeGoalPlayerId}
                  onClick={async () => {
                    await registerGoalForTeam(match.homeTeamId, homeGoalPlayerId, () => setHomeGoalPlayerId(''));
                  }}
                >
                  Add home goal
                </button>
              </article>

              <article className="goalTeamCard">
                <div className="goalTeamHeader">
                  <h5>{awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'Away team'}</h5>
                  <p className="goalTeamScore">Score: {match.awayScore ?? 0}</p>
                </div>
                <label>
                  Away players
                  <select
                    value={awayGoalPlayerId}
                    onChange={(event) => setAwayGoalPlayerId(event.target.value)}
                    disabled={!hasPlayableTeams}
                  >
                    <option value="">Select player</option>
                    {awayAvailablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} #{player.shirtNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="smallButton"
                  disabled={!hasPlayableTeams || !awayGoalPlayerId}
                  onClick={async () => {
                    await registerGoalForTeam(match.awayTeamId, awayGoalPlayerId, () => setAwayGoalPlayerId(''));
                  }}
                >
                  Add away goal
                </button>
              </article>
            </div>
            {goalMessages.length > 0 && (
              <ul className="messageList">
                {goalMessages.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
