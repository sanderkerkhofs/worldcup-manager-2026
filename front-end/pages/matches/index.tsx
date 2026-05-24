import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from '../../lib/useSession';
import { getOverview } from '../../services/competitionService';

export default function MatchesPage() {
  const { token } = useSession();
  const { data: overview, error, isLoading } = useSWR(['matches-overview', token ?? 'public'], () => getOverview(token));

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
      <section className="heroCard">
        <p className="eyebrow">Matches</p>
        <h2>Match control list</h2>
        <p className="muted">Open any match to fill in status, scores, and scorers.</p>
      </section>

      {roundsWithMatches.length === 0 ? (
        <section className="panelCard">
          <p className="muted">No matches are available yet.</p>
        </section>
      ) : (
        roundsWithMatches.map(({ round, matches }) => (
          <section key={round.id} className="stack">
            <div className="panelHeader">
              <h3>{round.orderNumber}. {round.name}</h3>
              <div className="rowButtons">
                <p className="muted">{matches.length} matches</p>
                <Link href={`/rounds/${round.id}`} className="smallButton">Open round page</Link>
              </div>
            </div>

            <div className="gridCols">
              {matches.map((match) => {
                const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                return (
                <article key={match.id} className="panelCard">
                  <h3>
                    {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.countryShortName}` : 'TBD'} vs{' '}
                    {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.countryShortName}` : 'TBD'}
                  </h3>
                  <p className="muted">{new Date(match.matchDate).toLocaleString()}</p>
                  <p className="muted">Score: {match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
                  <p className="muted">Status: {match.status}</p>
                  <div className="rowButtons">
                    <Link href={`/matches/${match.id}`} className="linkButton">Open editor</Link>
                  </div>
                </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}