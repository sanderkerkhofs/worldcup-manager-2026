import Link from 'next/link';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../lib/matchStatus';
import { useSession } from '../lib/useSession';
import { getOverview } from '../services/competitionService';

export default function RefereePage() {
  const { token, user } = useSession();
  const { data: overview, isLoading } = useSWR(token ? ['referee-overview', token] : null, () => getOverview(token));

  if (!token || user?.role !== 'REFEREE') {
    const isLoggedIn = Boolean(token && user);

    return (
      <section className="heroCard">
        <p className="eyebrow">Referee Area</p>
        <h2>Restricted access</h2>
        <p className="muted">
          {isLoggedIn
            ? 'Not authorised: only referees can access this page.'
            : 'Login as a seeded referee to update your assigned match.'}
        </p>
        {!isLoggedIn && <Link href="/login" className="linkButton">Go to login</Link>}
      </section>
    );
  }

  if (isLoading || !overview) {
    return <p className="muted">Loading referee workspace...</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const assignedMatches = overview.matches.filter((match) => match.refereeId === user.id);
  const assignedMatchesHeading = `Assigned Matches (${user.username})`;

  return (
    <div className="stack">
      <section className="panelCard stack">
        <header className="sectionTitleCard sectionTitleCardPlain">
          <div className="sectionTitleCopy">
            <p className="eyebrow">{assignedMatchesHeading}</p>
          </div>
        </header>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Fixture</th>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedMatches.map((match) => {
                const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                return (
                  <tr key={match.id}>
                    <td>{match.roundName}</td>
                    <td>
                      {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'TBD'} vs{' '}
                      {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'TBD'}
                    </td>
                    <td>{new Date(match.matchDate).toLocaleString()}</td>
                    <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                    <td>{getMatchStatusLabel(match.status)}</td>
                    <td>
                      <Link href={`/matches/${match.id}`} className="linkButton">Open match page</Link>
                    </td>
                  </tr>
                );
              })}
              {assignedMatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="tableEmptyCell">
                    <p className="muted">No assigned matches found for this referee.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
