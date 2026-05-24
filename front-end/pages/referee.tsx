import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from '../lib/useSession';
import { getOverview } from '../services/competitionService';

export default function RefereePage() {
  const { token, user } = useSession();
  const { data: overview, isLoading } = useSWR(token ? ['referee-overview', token] : null, () => getOverview(token));

  if (!token || user?.role !== 'REFEREE') {
    return (
      <section className="heroCard">
        <p className="eyebrow">Referee Area</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as a seeded referee to update your assigned match.</p>
        <Link href="/login" className="linkButton">Go to login</Link>
      </section>
    );
  }

  if (isLoading || !overview) {
    return <p className="muted">Loading referee workspace...</p>;
  }

  const assignedMatches = overview.matches.filter((match) => match.refereeId === user.id);

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">Referee Workspace</p>
        <h2>Assigned match queue</h2>
        <p className="muted">Open the match editor to update status, score, and scorers.</p>
      </section>

      <section className="gridCols">
        {assignedMatches.map((match) => {
          const homeTeam = match.homeTeamId ? (overview.teams.find((team) => team.id === match.homeTeamId)?.name ?? 'TBD') : 'TBD';
          const awayTeam = match.awayTeamId ? (overview.teams.find((team) => team.id === match.awayTeamId)?.name ?? 'TBD') : 'TBD';

          return (
            <article key={match.id} className="panelCard">
              <p className="eyebrow">Match editor</p>
              <h3>{homeTeam} vs {awayTeam}</h3>
              <p className="muted">Status: {match.status}</p>
              <Link href={`/matches/${match.id}`} className="linkButton">Open match page</Link>
            </article>
          );
        })}
        {assignedMatches.length === 0 && <p className="muted">No assigned matches found for this referee.</p>}
      </section>
    </div>
  );
}
