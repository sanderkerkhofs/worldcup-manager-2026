import Link from 'next/link';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { getOverview } from '../../services/competitionService';

export default function MatchesPage() {
  const { data: overview, error, isLoading } = useSWR(['matches-overview-public'], () => getOverview());

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

              <div className="gridCols">
                {matches.map((match) => {
                  const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                  const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                  return (
                  <article key={match.id} className="panelCard">
                    <h3>
                      {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'TBD'} vs{' '}
                      {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'TBD'}
                    </h3>
                    <p className="muted">{new Date(match.matchDate).toLocaleString()}</p>
                    <p className="muted">Referee: {match.refereeName ? `${match.refereeCountryFlag ?? ''} ${match.refereeName}`.trim() : 'Unassigned'}</p>
                    <p className="muted">Score: {match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
                    <p className="muted">Status: {getMatchStatusLabel(match.status)}</p>
                    <div className="rowButtons">
                      <Link href={`/matches/${match.id}`} className="linkButton">Open match</Link>
                    </div>
                  </article>
                  );
                })}
              </div>
            </article>
          </section>
        ))
      )}
    </div>
  );
}