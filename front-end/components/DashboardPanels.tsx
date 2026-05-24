import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from '../lib/useSession';
import {
  getPlayers,
  getRounds,
  getTopScorers,
  initiateRound,
  simulateRound,
  updateMatchResult,
  updateMatchStatus,
  updatePlayerStatus,
} from '../services/competitionService';
import { CompetitionOverview, Match, Player, PlayerStatus, Round } from '../types';

type Props = {
  overview: CompetitionOverview;
  token: string | null;
  onRefresh: () => Promise<void>;
};

function RoundCard({ round, matches, canManageRound, blockedReason, onInitiate, token, onRefresh }: {
  round: Round;
  matches: Match[];
  canManageRound: boolean;
  blockedReason?: string;
  onInitiate: () => Promise<void>;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [initiating, setInitiating] = useState(false);
  const [simulating, setSimulating] = useState(false);

  return (
    <article className="panelCard">
      <div className="panelHeader">
        <h3>{round.orderNumber}. {round.name}</h3>
        <div className="rowButtons">
          <button
            className="smallButton"
            disabled={!canManageRound || initiating}
            onClick={async () => {
              setInitiating(true);
              try {
                await onInitiate();
              } finally {
                setInitiating(false);
              }
            }}
          >
            {initiating ? 'Initiating...' : 'Initiate'}
          </button>
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

  return previousMatches.every((match) => match.status === 'COMPLETED');
}

export function AdminPanel({ overview, token, onRefresh }: Props) {
  const { data: rounds } = useSWR(token ? ['rounds', token] : null, () => getRounds(token));

  if (!token) {
    return null;
  }

  return (
    <section className="stack">
      <h2>Admin Controls</h2>
      <div className="gridCols">
        {(rounds ?? overview.rounds).map((round) => {
          const canManageRound = isRoundManageable(overview, round);
          const blockedReason = round.orderNumber > 1 && !canManageRound
            ? 'Requires previous round to be fully completed.'
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
              onInitiate={async () => {
                await initiateRound(round.id, token);
                await onRefresh();
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

export function CoachPanel({ overview, token, onRefresh }: Props) {
  const { user } = useSession();
  const teamId = user?.teamId;

  const { data: players } = useSWR(token && teamId ? ['players', teamId, token] : null, () => getPlayers(teamId!, token));

  if (!token || !teamId || !players) {
    return null;
  }

  const team = overview.teams.find((item) => item.id === teamId);

  return (
    <section className="stack">
      <h2>Coach Controls</h2>
      <p className="muted">Manage availability for {team?.name ?? 'your team'}.</p>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player: Player) => {
              const nextStatus: PlayerStatus = player.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';

              return (
                <tr key={player.id}>
                  <td>{player.firstName} {player.lastName} #{player.shirtNumber}</td>
                  <td>{player.position}</td>
                  <td><span className={`chip ${player.status === 'AVAILABLE' ? 'chipOk' : 'chipWarn'}`}>{player.status}</span></td>
                  <td>
                    <button
                      className="smallButton"
                      onClick={async () => {
                        await updatePlayerStatus(player.id, nextStatus, token);
                        await onRefresh();
                      }}
                    >
                      Set {nextStatus}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
      <h2>Referee Controls</h2>
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
                <p className="muted">Status: {match.status}</p>
                <div className="rowButtons">
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'ACTIVE', token); await onRefresh(); }}>Set ACTIVE</button>
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'COMPLETED', token); await onRefresh(); }}>Set COMPLETED</button>
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
      <h2>Top Scorers</h2>
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
            {(topScorers ?? []).map((row) => (
              <tr key={row.playerId}>
                <td>{row.teamCountryFlag} {row.playerName}</td>
                <td>{row.teamCountryFlag} {row.teamName}</td>
                <td>{row.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
