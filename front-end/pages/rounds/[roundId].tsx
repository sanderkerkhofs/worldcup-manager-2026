import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from '../../lib/useSession';
import { getOverview, simulateRound } from '../../services/competitionService';

export default function RoundDetailPage() {
  const router = useRouter();
  const { roundId } = router.query;
  const { isAuthenticated, token, user } = useSession();
  const [busyAction, setBusyAction] = useState<'simulate' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canViewRound = isAuthenticated && user?.role !== 'GUEST';

  const { data: overview, error, isLoading, mutate } = useSWR(
    canViewRound && router.isReady && typeof roundId === 'string' ? ['round-detail', roundId, token ?? 'public'] : null,
    () => getOverview(token),
  );

  if (!canViewRound) {
    return (
      <section className="heroCard">
        <p className="eyebrow">Rounds</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as a user to view round details and match links.</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">Go to login</Link>
          <Link href="/register" className="linkButton">Go to register</Link>
        </div>
      </section>
    );
  }

  if (!router.isReady) {
    return <p className="muted">Loading round...</p>;
  }

  if (isLoading) {
    return <p className="muted">Loading round...</p>;
  }

  if (error || !overview || typeof roundId !== 'string') {
    return <p className="errorText">Unable to load round details.</p>;
  }

  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const round = orderedRounds.find((item) => item.id === roundId);

  if (!round) {
    return <p className="errorText">Round not found.</p>;
  }

  const previousRound = orderedRounds.find((item) => item.orderNumber === round.orderNumber - 1);
  const previousMatches = previousRound ? overview.matches.filter((match) => match.roundId === previousRound.id) : [];
  const canManageRound = round.orderNumber === 1 || (previousMatches.length > 0 && previousMatches.every((match) => match.status === 'FINISHED' || match.status === 'COMPLETED'));

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const roundMatches = overview.matches
    .filter((match) => match.roundId === round.id)
    .sort((left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime());

  const isAdmin = user?.role === 'ADMIN' && !!token;

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">Round {round.orderNumber}</p>
        <h2>{round.name}</h2>
        <p className="muted">{roundMatches.length} matches in this round.</p>
        <div className="rowButtons">
          <Link className="linkButton" href="/rounds">Back to all rounds</Link>
          <Link className="linkButton" href="/matches">Open all matches</Link>
        </div>
      </section>

      {isAdmin && (
        <section className="panelCard stack">
          <div className="panelHeader">
            <h3>Admin Controls</h3>
          </div>
          {!canManageRound && round.orderNumber > 1 && (
            <p className="muted">Previous round must be fully finished before simulating this round.</p>
          )}
          {message && <p className="muted">{message}</p>}
          <div className="rowButtons">
            <button
              className="smallButton"
              disabled={!canManageRound || busyAction === 'simulate'}
              onClick={async () => {
                if (!token) return;
                setBusyAction('simulate');
                setMessage(null);
                try {
                  const result = await simulateRound(round.id, token);
                  await mutate();
                  setMessage(`Simulated ${result.matches.length} matches with ${result.goalsCreated} goals.`);
                } catch (actionError) {
                  setMessage(actionError instanceof Error ? actionError.message : 'Unable to simulate round.');
                } finally {
                  setBusyAction(null);
                }
              }}
            >
              {busyAction === 'simulate' ? 'Simulating...' : 'Simulate round'}
            </button>
          </div>
        </section>
      )}

      <section className="panelCard stack">
        <p className="eyebrow">Matches</p>
        {roundMatches.length === 0 ? (
          <p className="muted">No matches exist for this round yet.</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {roundMatches.map((match) => {
                  const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                  const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;
                  const homeName = homeTeam ? `${homeTeam.countryFlag} ${homeTeam.countryShortName}` : 'TBD';
                  const awayName = awayTeam ? `${awayTeam.countryFlag} ${awayTeam.countryShortName}` : 'TBD';

                  return (
                    <tr key={match.id}>
                      <td>{homeName} vs {awayName}</td>
                      <td>{new Date(match.matchDate).toLocaleString()}</td>
                      <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                      <td>{match.status}</td>
                      <td>
                        <Link href={`/matches/${match.id}`} className="linkButton">Open match editor</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
