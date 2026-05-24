import Link from 'next/link';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faArrowUpRightFromSquare,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { CoachPanel, RefereePanel, ScorePanel } from '../components/DashboardPanels';
import { getOverview } from '../services/competitionService';
import { useSession } from '../lib/useSession';

export default function HomePage() {
  const { token, user } = useSession();
  const { data: overview, error, isLoading, mutate } = useSWR(['overview', token ?? 'public'], () => getOverview(token));

  if (isLoading) {
    return <p className="muted">Loading competition data...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="stack">
      <section className="stack">
        <h2><span className="iconLabel"><FontAwesomeIcon icon={faTrophy} /> Bracket Overview</span></h2>
        <div className="gridCols">
          {overview.rounds.map((round) => {
            const roundMatches = overview.matches.filter((match) => match.roundId === round.id);

            return (
              <article key={round.id} className="panelCard">
                <div className="panelHeader">
                  <h3>{round.name}</h3>
                  <Link className="smallButton" href={`/rounds/${round.id}`}><span className="iconLabel"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Manage</span></Link>
                </div>
                {roundMatches.length === 0 ? (
                  <p className="muted">No matches yet.</p>
                ) : (
                  <ul className="matchList">
                    {roundMatches.map((match) => {
                      const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                      const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                      return (
                        <li key={match.id}>
                          <span>
                            {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.countryShortName}` : 'TBD'} vs{' '}
                            {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.countryShortName}` : 'TBD'}
                          </span>
                          <strong>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</strong>
                          <div className="matchRowFooter rowButtons">
                            <small>{match.status}</small>
                            {isAdmin && (
                              <Link className="smallButton matchEditButton" href={`/matches/${match.id}`}>
                                <span className="iconLabel"><FontAwesomeIcon icon={faPenToSquare} /> Edit</span>
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>Standings Snapshot</h2>
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
                  <td>{row.teamName}</td>
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
      </section>

      <ScorePanel token={token} />

      {user?.role === 'COACH' && <CoachPanel overview={overview} token={token} onRefresh={async () => { await mutate(); }} />}
      {user?.role === 'REFEREE' && <RefereePanel overview={overview} token={token} onRefresh={async () => { await mutate(); }} />}
    </div>
  );
}
