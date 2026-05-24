import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
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
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  const rounds = overview?.rounds ?? [];
  const matches = overview?.matches ?? [];

  const orderedRounds = useMemo(
    () => [...rounds].sort((left, right) => left.orderNumber - right.orderNumber),
    [rounds],
  );

  const defaultStartedRoundId = useMemo(() => {
    const startedRound = orderedRounds.find((round) => {
      const roundMatches = matches.filter((match) => match.roundId === round.id);
      return roundMatches.some((match) => match.status === 'IN_PROGRESS' || match.status === 'COMPLETED');
    });

    return startedRound?.id ?? orderedRounds[0]?.id ?? null;
  }, [orderedRounds, matches]);

  useEffect(() => {
    if (!selectedRoundId || !orderedRounds.some((round) => round.id === selectedRoundId)) {
      setSelectedRoundId(defaultStartedRoundId);
    }
  }, [selectedRoundId, orderedRounds, defaultStartedRoundId]);

  const selectedRoundIndex = orderedRounds.findIndex((round) => round.id === selectedRoundId);
  const selectedRound = selectedRoundIndex >= 0 ? orderedRounds[selectedRoundIndex] : null;
  const selectedRoundMatches = selectedRound
    ? matches.filter((match) => match.roundId === selectedRound.id)
    : [];
  const hasPreviousRound = selectedRoundIndex > 0;
  const hasNextRound = selectedRoundIndex >= 0 && selectedRoundIndex < orderedRounds.length - 1;

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
        {selectedRound ? (
          <article className="panelCard">
            <div className="roundNavControls">
              <button
                className="smallButton roundNavButton"
                type="button"
                disabled={!hasPreviousRound}
                onClick={() => {
                  if (hasPreviousRound) {
                    setSelectedRoundId(orderedRounds[selectedRoundIndex - 1].id);
                  }
                }}
              >
                <span className="iconLabel"><FontAwesomeIcon icon={faChevronLeft} /> Previous</span>
              </button>

              <Link className="smallButton roundNavButton" href={`/rounds/${selectedRound.id}`}>
                <span className="iconLabel"><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="roundNavIcon" /> Manage</span>
              </Link>

              <button
                className="smallButton roundNavButton"
                type="button"
                disabled={!hasNextRound}
                onClick={() => {
                  if (hasNextRound) {
                    setSelectedRoundId(orderedRounds[selectedRoundIndex + 1].id);
                  }
                }}
              >
                <span className="iconLabel">Next <FontAwesomeIcon icon={faChevronRight} /></span>
              </button>
            </div>

            <div className="panelHeader">
              <h3>{selectedRound.name}</h3>
            </div>

            {selectedRoundMatches.length === 0 ? (
              <p className="muted">No matches yet.</p>
            ) : (
              <ul className="matchList">
                {selectedRoundMatches.map((match) => {
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
        ) : (
          <article className="panelCard">
            <p className="muted">No rounds found.</p>
          </article>
        )}
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
      </section>

      <ScorePanel token={token} />

      {user?.role === 'COACH' && <CoachPanel overview={overview} token={token} onRefresh={async () => { await mutate(); }} />}
      {user?.role === 'REFEREE' && <RefereePanel overview={overview} token={token} onRefresh={async () => { await mutate(); }} />}
    </div>
  );
}
