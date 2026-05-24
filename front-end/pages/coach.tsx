import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from '../lib/useSession';
import { getOverview, getPlayers, updatePlayerStatus } from '../services/competitionService';

export default function CoachPage() {
  const { token, user } = useSession();
  const { data: overview, isLoading } = useSWR(token ? ['coach-overview', token] : null, () => getOverview(token));
  const { data: players, mutate } = useSWR(token && user?.teamId ? ['coach-players', user.teamId, token] : null, () => getPlayers(user!.teamId!, token));

  const team = useMemo(
    () => overview?.teams.find((candidate) => candidate.id === user?.teamId),
    [overview?.teams, user?.teamId],
  );
  const teamWorkspaceLabel = team
    ? `${team.countryFlag} ${team.name}`
    : user?.countryFlag
      ? `${user.countryFlag} Your team`
      : 'Your team';

  if (!token || user?.role !== 'COACH') {
    return (
      <section className="heroCard">
        <p className="eyebrow">Coach Area</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as the seeded coach user to manage player availability.</p>
        <Link href="/login" className="linkButton">Go to login</Link>
      </section>
    );
  }

  if (isLoading || !overview || !players) {
    return <p className="muted">Loading coach workspace...</p>;
  }

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">Coach Workspace</p>
        <h2>{teamWorkspaceLabel}</h2>
        <p className="muted">Keep squad availability clean so referees can only select available players.</p>
      </section>

      <section className="stack">
        <div className="panelHeader">
          <h2>Player Availability</h2>
          <Link href="/" className="linkButton">View dashboard</Link>
        </div>
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
              {players.map((player) => {
                const nextStatus = player.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
                return (
                  <tr key={player.id}>
                    <td>{player.firstName} {player.lastName} #{player.shirtNumber}</td>
                    <td>{player.position}</td>
                    <td><span className={`chip ${player.status === 'AVAILABLE' ? 'chipOk' : 'chipWarn'}`}>{player.status}</span></td>
                    <td>
                      <button
                        className="smallButton"
                        onClick={async () => {
                          if (!token) return;
                          await updatePlayerStatus(player.id, nextStatus, token);
                          await mutate();
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
    </div>
  );
}
