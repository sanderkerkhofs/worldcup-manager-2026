import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../lib/matchStatus';
import { getOverview } from '../services/competitionService';
import { useSession } from '../lib/useSession';

export default function HomePage() {
  const { token } = useSession();
  const { data: overview, error, isLoading } = useSWR(['overview', token ?? 'public'], () => getOverview(token));

  const rounds = overview?.rounds ?? [];
  const matches = overview?.matches ?? [];
  const standings = overview?.standings ?? [];
  const topScorers = overview?.topScorers ?? [];

  const teamById = new Map((overview?.teams ?? []).map((team) => [team.id, team]));
  const orderedRounds = useMemo(
    () => [...rounds].sort((left, right) => left.orderNumber - right.orderNumber),
    [rounds],
  );

  const currentRound = useMemo(() => {
    const activeRound = orderedRounds.find((round) => {
      const roundMatches = matches.filter((match) => match.roundId === round.id);
      return roundMatches.some((match) => match.status === 'NOT_STARTED' || match.status === 'IN_PROGRESS' || match.status === 'FINISHED');
    });

    return activeRound ?? orderedRounds[orderedRounds.length - 1] ?? null;
  }, [matches, orderedRounds]);

  const currentRoundMatches = useMemo(
    () => currentRound
      ? matches
        .filter((match) => match.roundId === currentRound.id)
        .sort((left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime())
      : [],
    [currentRound, matches],
  );

  const topFiveStandings = useMemo(() => [...standings].slice(0, 5), [standings]);
  const topFiveScorers = useMemo(() => [...topScorers].slice(0, 5), [topScorers]);

  if (isLoading) {
    return <p className="muted">Loading competition data...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>;
  }

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">Current Round</p>
          {currentRound ? (
            <>
              <div className="sectionTitleCard sectionTitleCardPlain">
                <div className="sectionTitleCopy">
                  <h3>{currentRound.name}</h3>
                </div>
              </div>

              {currentRoundMatches.length === 0 ? (
                <p className="muted">No matches yet.</p>
              ) : (
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fixture</th>
                        <th>Score</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Referee</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRoundMatches.map((match) => {
                        const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                        const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                        return (
                          <tr key={match.id}>
                            <td>
                              {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'TBD'} vs{' '}
                              {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'TBD'}
                            </td>
                            <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                            <td>{new Date(match.matchDate).toLocaleString()}</td>
                            <td>{getMatchStatusLabel(match.status)}</td>
                            <td>{match.refereeName ?? 'Unassigned'}</td>
                            <td>
                              <Link href={`/matches/${match.id}`} className="linkButton">Open match</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="muted">No rounds found.</p>
          )}
        </article>
      </section>

      <section className="gridCols">
        <article className="panelCard stack">
          <p className="eyebrow">Top 5 Standings</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                {topFiveStandings.map((row) => (
                  <tr key={row.teamId}>
                    <td>{teamById.get(row.teamId)?.countryFlag ? `${teamById.get(row.teamId)?.countryFlag} ` : ''}{row.teamName}</td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panelCard stack">
          <p className="eyebrow">Top 5 Goalscorers</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Goals</th>
                </tr>
              </thead>
              <tbody>
                {topFiveScorers.length > 0 ? (
                  topFiveScorers.map((row) => (
                    <tr key={row.playerId}>
                      <td>{row.playerName}</td>
                      <td>{row.teamCountryFlag} {row.teamName}</td>
                      <td>{row.goals}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="tableEmptyCell">
                      <div className="tableEmptyState">
                        <strong className="tableEmptyTitle">No scorers yet</strong>
                        <span className="tableEmptyHint">This board fills up as soon as the first goals are registered.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
