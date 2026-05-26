import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from '../../lib/useSession';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { getOverview } from '../../services/competitionService';

export default function MatchesPage() {
  const { isAuthenticated, user } = useSession();
  const { data: overview, error, isLoading } = useSWR(['matches-overview-public'], () => getOverview());

  if (!isAuthenticated || user?.role === 'GUEST') {
    return (
      <section className="heroCard">
        <p className="eyebrow">Matches</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as a user to view matches and round schedules.</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">Go to login</Link>
          <Link href="/register" className="linkButton">Go to register</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">Loading match list...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Unable to load matches.</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const roundsWithMatches = orderedRounds
    .map((round) => ({
      round,
      matches: overview.matches
        .filter((match) => match.roundId === round.id)
        .sort((left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime()),
    }))
    .filter((item) => item.matches.length > 0);

  return (
    <div className="stack">
      {roundsWithMatches.length === 0 ? (
        <section className="panelCard">
          <p className="muted">No matches are available yet.</p>
        </section>
      ) : (
        roundsWithMatches.map(({ round, matches }) => (
          <section key={round.id}>
            <article className="panelCard stack">
              <header className="sectionTitleCard sectionTitleCardPlain">
                <div className="sectionTitleCopy">
                  <p className="eyebrow">Round {round.orderNumber} - {round.name}</p>
                </div>
              </header>

              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fixture</th>
                      <th>Date</th>
                      <th>Referee</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => {
                      const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                      const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                      return (
                        <tr key={match.id}>
                          <td>
                            {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'TBD'} vs{' '}
                            {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'TBD'}
                          </td>
                          <td>{new Date(match.matchDate).toLocaleString()}</td>
                          <td>{match.refereeName ?? 'Unassigned'}</td>
                          <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                          <td>{getMatchStatusLabel(match.status)}</td>
                          <td>
                            <Link href={`/matches/${match.id}`} className="linkButton">Open match</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ))
      )}
    </div>
  );
}