import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  const [goalMinute, setGoalMinute] = useState('');
  const [goalTeamId, setGoalTeamId] = useState('');
  const [goalPlayerId, setGoalPlayerId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [goalMessages, setGoalMessages] = useState<string[]>([]);

  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setHomeScore(match.homeScore?.toString() ?? '');
      setAwayScore(match.awayScore?.toString() ?? '');
      setGoalTeamId(match.homeTeamId ?? '');
    }
  }, [match]);

  const availablePlayers = useMemo(() => {
    const players = [...(homePlayers ?? []), ...(awayPlayers ?? [])];
    return players.filter((player) => player.status === 'AVAILABLE');
  }, [awayPlayers, homePlayers]);

  const selectedTeamPlayers = availablePlayers.filter((player) => player.teamId === goalTeamId);

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
  const canEdit = user?.role === 'ADMIN' || user?.role === 'REFEREE';
  const hasPlayableTeams = !!match.homeTeamId && !!match.awayTeamId;

  return (
    <div className="matchEditorLayout">
      <section className="heroCard">
        <p className="eyebrow">Match Details</p>
        <h2>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'Home'} vs {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'Away'}</h2>
        <p className="muted">Status, score, and scorers live here. Editing is limited to admins and referees.</p>
        <div className="rowButtons">
          <Link href="/" className="linkButton">Back to dashboard</Link>
          {token && <Link href="/referee" className="linkButton">Referee area</Link>}
        </div>
      </section>

      <section className="splitGrid">
        <article className="panelCard editorSidebar">
          <h3>Match info</h3>
          <p><strong>Round:</strong> {overview.rounds.find((round) => round.id === match.roundId)?.name ?? 'Round'}</p>
          <p><strong>Date:</strong> {new Date(match.matchDate).toLocaleString()}</p>
          <p><strong>Referee:</strong> {overviewMatch?.refereeName ?? 'Unassigned'}</p>
          <p><strong>Current score:</strong> {match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
          <p><strong>Status:</strong> {getMatchStatusLabel(match.status)}</p>
          {!hasPlayableTeams && <p className="muted">Teams are not assigned to this match yet.</p>}
        </article>

        <article className="panelCard">
          <div className="panelHeader">
            <h3>Edit match status</h3>
          </div>
          <div className="formGrid">
            <label>
              Match status
              <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canEdit || !hasPlayableTeams}>
                <option value="PLANNED">PLANNED</option>
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="FINISHED">FINISHED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <label>
              Home score
              <input type="number" min={0} value={homeScore} onChange={(event) => setHomeScore(event.target.value)} disabled={!canEdit || !hasPlayableTeams} />
            </label>
            <label>
              Away score
              <input type="number" min={0} value={awayScore} onChange={(event) => setAwayScore(event.target.value)} disabled={!canEdit || !hasPlayableTeams} />
            </label>
          </div>
          <div className="rowButtons">
            <button
              className="smallButton"
              disabled={!canEdit || !hasPlayableTeams}
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
          {message && <p className="muted">{message}</p>}
        </article>
      </section>

      <section className="panelCard">
        <div className="panelHeader">
          <h3>Record goal scorer</h3>
          <p className="muted">Only available players from the two teams can be selected.</p>
        </div>
        <form
          className="formGrid compactForm"
          onSubmit={async (event: FormEvent) => {
            event.preventDefault();
            if (!token || !goalPlayerId || !goalTeamId || !goalMinute) {
              return;
            }

            await addGoal(match.id, {
              playerId: goalPlayerId,
              teamId: goalTeamId,
              minute: Number(goalMinute),
            }, token);

            setGoalMessages((current) => [`Goal saved for minute ${goalMinute}.`, ...current].slice(0, 4));
            setGoalMinute('');
            setGoalPlayerId('');
            await mutateMatch();
          }}
        >
          <label>
            Team
            <select
              value={goalTeamId}
              onChange={(event) => {
                setGoalTeamId(event.target.value);
                setGoalPlayerId('');
              }}
              disabled={!canEdit || !hasPlayableTeams}
            >
              <option value="">Select team</option>
              {match.homeTeamId && <option value={match.homeTeamId}>{homeTeam?.name ?? 'Home team'}</option>}
              {match.awayTeamId && <option value={match.awayTeamId}>{awayTeam?.name ?? 'Away team'}</option>}
            </select>
          </label>
          <label>
            Scorer
            <select value={goalPlayerId} onChange={(event) => setGoalPlayerId(event.target.value)} disabled={!canEdit || !hasPlayableTeams || !goalTeamId}>
              <option value="">Select player</option>
              {selectedTeamPlayers.map((player) => (
                <option key={player.id} value={player.id}>{player.firstName} {player.lastName} #{player.shirtNumber}</option>
              ))}
            </select>
          </label>
          <label>
            Minute
            <input type="number" min={0} value={goalMinute} onChange={(event) => setGoalMinute(event.target.value)} disabled={!canEdit || !hasPlayableTeams} />
          </label>
          <button className="smallButton" disabled={!canEdit || !hasPlayableTeams}>Save goal</button>
        </form>
        {goalMessages.length > 0 && (
          <ul className="messageList">
            {goalMessages.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
