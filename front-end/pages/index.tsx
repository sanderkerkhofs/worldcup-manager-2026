import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { RefereePanel } from '../components/DashboardPanels';
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

  return (
    <div className="stack">
      <section className="stack">
        {selectedRound ? (
          <article className="panelCard stack">
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

            <div className="sectionTitleCard">
              <div className="sectionTitleCopy">
                <p className="eyebrow">Round {selectedRound.orderNumber}</p>
                <h3>{selectedRound.name}</h3>
              </div>
              <p className="muted">{selectedRoundMatches.length} matches</p>
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
                      <Link className="matchListCardLink" href={`/matches/${match.id}`}>
                        <span>
                          {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : 'TBD'} vs{' '}
                          {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : 'TBD'}
                        </span>
                        <strong>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</strong>
                        <div className="matchRowFooter rowButtons">
                          <small>{match.status}</small>
                        </div>
                      </Link>
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

      {user?.role === 'REFEREE' && <RefereePanel overview={overview} token={token} onRefresh={async () => { await mutate(); }} />}
    </div>
  );
}
