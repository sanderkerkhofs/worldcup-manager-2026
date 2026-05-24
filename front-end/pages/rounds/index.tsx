import Link from 'next/link';
import useSWR from 'swr';
import { getOverview } from '../../services/competitionService';
import { useSession } from '../../lib/useSession';

export default function RoundsPage() {
  const { token } = useSession();
  const { data: overview, error, isLoading } = useSWR(['rounds-overview', token ?? 'public'], () => getOverview(token));

  if (isLoading) {
    return <p className="muted">Loading rounds...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Unable to load rounds.</p>;
  }

  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">Rounds</p>
        <h2>Competition Rounds</h2>
        <p className="muted">Open a round page to view matches and, as admin, run round actions.</p>
      </section>

      <section className="gridCols">
        {orderedRounds.map((round) => {
          const matches = overview.matches.filter((match) => match.roundId === round.id);
          const completed = matches.filter((match) => match.status === 'COMPLETED').length;
          const active = matches.filter((match) => match.status === 'IN_PROGRESS').length;
          const roundStatus = completed === matches.length && matches.length > 0
            ? 'FINISHED'
            : active > 0
              ? 'IN_PROGRESS'
              : 'NOT_STARTED';

          return (
            <article key={round.id} className="panelCard">
              <p className="eyebrow">Round {round.orderNumber}</p>
              <h3>{round.name}</h3>
              <p className="muted">Matches: {matches.length}</p>
              <p className="muted">Completed: {completed}/{matches.length}</p>
              <p className="muted">Status: {roundStatus}</p>
              <div className="rowButtons">
                <Link className="linkButton" href={`/rounds/${round.id}`}>Open round page</Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
