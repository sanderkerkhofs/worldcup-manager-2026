import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../lib/matchStatus';
import { useSession } from '../lib/useSession';
import {
  getRounds,
  getTopScorers,
  simulateRound,
  updateMatchResult,
  updateMatchStatus,
} from '../services/competitionService';
import { CompetitionOverview, Match, Round } from '../types';

type Props = {
  overview: CompetitionOverview;
  token: string | null;
  onRefresh: () => Promise<void>;
};

function RoundCard({ round, matches, canManageRound, blockedReason, token, onRefresh }: {
  round: Round;
  matches: Match[];
  canManageRound: boolean;
  blockedReason?: string;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [simulating, setSimulating] = useState(false);

  return (
    <article className="panelCard">
      <div className="panelHeader">
        <h3>{round.orderNumber}. {round.name}</h3>
        <div className="rowButtons">
          <button
            className="smallButton"
            disabled={!canManageRound || simulating}
            onClick={async () => {
              setSimulating(true);
              try {
                await simulateRound(round.id, token);
                await onRefresh();
              } finally {
                setSimulating(false);
              }
            }}
          >
            {simulating ? 'Simulating...' : 'Simulate'}
          </button>
        </div>
      </div>
      <p className="muted">Matches: {matches.length}</p>
      {!canManageRound && blockedReason && <p className="muted">{blockedReason}</p>}
    </article>
  );
}

function isRoundManageable(overview: CompetitionOverview, round: Round) {
  if (round.orderNumber === 1) {
    return true;
  }

  const previousRound = overview.rounds.find((candidate) => candidate.orderNumber === round.orderNumber - 1);

  if (!previousRound) {
    return false;
  }

  const previousMatches = overview.matches.filter((match) => match.roundId === previousRound.id);

  if (previousMatches.length === 0) {
    return false;
  }

  return previousMatches.every((match) => match.status === 'FINISHED' || match.status === 'COMPLETED');
}

export function AdminPanel({ overview, token, onRefresh }: Props) {
  const { data: rounds } = useSWR(token ? ['rounds', token] : null, () => getRounds(token));

  if (!token) {
    return null;
  }

  return (
    <section className="stack">
      <header className="sectionTitleCard">
        <div className="sectionTitleCopy">
          <p className="eyebrow">Admin</p>
          <h2>Admin Controls</h2>
        </div>
      </header>
      <div className="gridCols">
        {(rounds ?? overview.rounds).map((round) => {
          const canManageRound = isRoundManageable(overview, round);
          const blockedReason = round.orderNumber > 1 && !canManageRound
            ? 'Requires previous round to be fully finished.'
            : undefined;

          return (
            <RoundCard
              key={round.id}
              round={round}
              matches={overview.matches.filter((match) => match.roundId === round.id)}
              canManageRound={canManageRound}
              blockedReason={blockedReason}
              token={token}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>
    </section>
  );
}

export function RefereePanel({ overview, token, onRefresh }: Props) {
  const { user } = useSession();
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: string; away: string }>>({});

  const assignedMatches = useMemo(
    () => overview.matches.filter((match) => match.refereeId === user?.id),
    [overview.matches, user?.id],
  );

  if (!token) {
    return null;
  }

  return (
    <section className="stack">
      <header className="sectionTitleCard">
        <div className="sectionTitleCopy">
          <p className="eyebrow">Referee</p>
          <h2>Referee Controls</h2>
        </div>
      </header>
      {assignedMatches.length === 0 ? (
        <p className="muted">No assigned matches for this referee.</p>
      ) : (
        <div className="gridCols">
          {assignedMatches.map((match) => {
            const homeTeam = match.homeTeamId ? (overview.teams.find((team) => team.id === match.homeTeamId)?.name ?? 'TBD') : 'TBD';
            const awayTeam = match.awayTeamId ? (overview.teams.find((team) => team.id === match.awayTeamId)?.name ?? 'TBD') : 'TBD';
            const hasPlayableTeams = !!match.homeTeamId && !!match.awayTeamId;
            const input = scoreInputs[match.id] ?? { home: '', away: '' };

            return (
              <article key={match.id} className="panelCard">
                <h3>{homeTeam} vs {awayTeam}</h3>
                <p className="muted">Status: {getMatchStatusLabel(match.status)}</p>
                <div className="rowButtons">
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'IN_PROGRESS', token); await onRefresh(); }}>Set IN_PROGRESS</button>
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'FINISHED', token); await onRefresh(); }}>Set FINISHED</button>
                </div>
                <div className="scoreInputs">
                  <input
                    type="number"
                    min={0}
                    placeholder="Home"
                    value={input.home}
                    disabled={!hasPlayableTeams}
                    onChange={(event) => setScoreInputs((current) => ({
                      ...current,
                      [match.id]: { ...input, home: event.target.value },
                    }))}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Away"
                    value={input.away}
                    disabled={!hasPlayableTeams}
                    onChange={(event) => setScoreInputs((current) => ({
                      ...current,
                      [match.id]: { ...input, away: event.target.value },
                    }))}
                  />
                  <button
                    className="smallButton"
                    disabled={!hasPlayableTeams}
                    onClick={async () => {
                      const home = Number(input.home);
                      const away = Number(input.away);

                      if (Number.isNaN(home) || Number.isNaN(away)) {
                        return;
                      }

                      await updateMatchResult(match.id, home, away, token);
                      await onRefresh();
                    }}
                  >
                    Save Score
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ScorePanel({ token }: { token: string | null }) {
  const { data: topScorers } = useSWR(token ? ['topscorers', token] : 'topscorers-public', () => getTopScorers(token));

  return (
    <section className="stack">
      <article className="panelCard stack">
        <p className="eyebrow">Goalscoring Leaderboard</p>
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
              {(topScorers ?? []).length > 0 ? (
                (topScorers ?? []).map((row) => (
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
                      <span className="tableEmptyHint">Goals will appear here once matches start producing scorers.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
