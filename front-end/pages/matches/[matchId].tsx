import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from '../../lib/useSession';
import { addGoal, getMatch, getOverview, getPlayers, updateMatchResult, updateMatchStatus } from '../../services/competitionService';

export default function MatchEditorPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const { token, user } = useSession();
  const isReady = typeof matchId === 'string';

  const { data: overview } = useSWR(token ? ['match-overview', token] : null, () => getOverview(token));
  const { data: match, mutate: mutateMatch } = useSWR(isReady ? ['match', matchId, token] : null, () => getMatch(matchId as string, token));
  const { data: homePlayers } = useSWR(token && match?.homeTeamId ? ['players-home', match.homeTeamId, token] : null, () => getPlayers(match!.homeTeamId as string, token));
  const { data: awayPlayers } = useSWR(token && match?.awayTeamId ? ['players-away', match.awayTeamId, token] : null, () => getPlayers(match!.awayTeamId as string, token));

  const [status, setStatus] = useState('NOT_STARTED');
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

  if (!isReady) {
    return <p className="muted">Loading match editor...</p>;
  }

  if (!token) {
    return (
      <section className="heroCard">
        <p className="eyebrow">Match Editor</p>
        <h2>Authentication required</h2>
        <p className="muted">Login to update match status, scores, and goal scorers.</p>
        <Link href="/login" className="linkButton">Go to login</Link>
      </section>
    );
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
        <p className="eyebrow">Match Editor</p>
        <h2>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'Home'} vs {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'Away'}</h2>
        <p className="muted">Status, score, and scorers live here. Use this page for the referee workflow.</p>
        <div className="rowButtons">
          <Link href="/" className="linkButton">Back to dashboard</Link>
          <Link href="/referee" className="linkButton">Referee area</Link>
        </div>
      </section>

      <section className="splitGrid">
        <article className="panelCard editorSidebar">
          <h3>Match info</h3>
          <p><strong>Round:</strong> {overview.rounds.find((round) => round.id === match.roundId)?.name ?? 'Round'}</p>
          <p><strong>Date:</strong> {new Date(match.matchDate).toLocaleString()}</p>
          <p><strong>Referee:</strong> {overviewMatch?.refereeName ? `${overviewMatch.refereeCountryFlag ?? ''} ${overviewMatch.refereeName}`.trim() : 'Unassigned'}</p>
          <p><strong>Home coach:</strong> {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.coach}` : 'TBD'}</p>
          <p><strong>Away coach:</strong> {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.coach}` : 'TBD'}</p>
          <p><strong>Current score:</strong> {match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
          <p><strong>Status:</strong> {match.status}</p>
          {!hasPlayableTeams && <p className="muted">Round not initiated yet for this match.</p>}
        </article>

        <article className="panelCard">
          <div className="panelHeader">
            <h3>Edit match status</h3>
          </div>
          <div className="formGrid">
            <label>
              Match status
              <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canEdit || !hasPlayableTeams}>
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="ACTIVE">ACTIVE</option>
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
                await updateMatchStatus(match.id, status as 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED', token);
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
