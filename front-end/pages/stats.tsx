import Link from 'next/link';
import useSWR from 'swr';
import { ScorePanel } from '../components/DashboardPanels';
import { useSession } from '../lib/useSession';
import { getOverview } from '../services/competitionService';

export default function StatsPage() {
  const { isAuthenticated, user, token } = useSession();
  const { data: overview, error, isLoading } = useSWR(['stats-overview', token ?? 'public'], () => getOverview(token));

  if (!isAuthenticated || user?.role === 'GUEST') {
    return (
      <section className="heroCard">
        <p className="eyebrow">Goalscoring Leaderboard</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as a user to view standings and score summaries.</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">Go to login</Link>
          <Link href="/register" className="linkButton">Go to register</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">Loading stats...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Unable to load stats.</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">Tournament Standings</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                {overview.standings.map((row) => (
                  <tr key={row.teamId}>
                    <td>{teamById.get(row.teamId)?.countryFlag ? `${teamById.get(row.teamId)?.countryFlag} ` : ''}{row.teamName}</td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <ScorePanel token={token} />
    </div>
  );
}