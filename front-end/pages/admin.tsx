import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from '../lib/useSession';
import { getOverview } from '../services/competitionService';
import { deleteUser, listUsers } from '../services/authService';

export default function AdminPage() {
  const { token, user } = useSession();
  const { data: overview, error, isLoading, mutate } = useSWR(token ? ['admin-overview', token] : null, () => getOverview(token));
  const { data: users, mutate: mutateUsers } = useSWR(token ? ['admin-users', token] : null, () => listUsers(token!));
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!token || user?.role !== 'ADMIN') {
    return (
      <section className="heroCard">
        <p className="eyebrow">Admin Area</p>
        <h2>Restricted access</h2>
        <p className="muted">Login as admin to manage matches and rounds.</p>
        <Link href="/login" className="linkButton">Go to login</Link>
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">Loading admin workspace...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Failed to load admin workspace.</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">Admin Workspace</p>
        <h2>Competition control room</h2>
        <p className="muted">Manage users and open round pages for competition progression.</p>
      </section>

      <section className="stack">
        <div className="panelHeader">
          <h2>User Management</h2>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Country</th>
                <th>Role</th>
                <th>Team</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((managedUser) => (
                <tr key={managedUser.id}>
                  <td>{managedUser.countryFlag ? `${managedUser.countryFlag} ` : ''}{managedUser.username}</td>
                  <td>{managedUser.countryShortName ?? '-'}</td>
                  <td>{managedUser.role}</td>
                  <td>{managedUser.teamId ? (() => {
                    const team = teamById.get(managedUser.teamId);
                    return team ? `${team.countryFlag} ${team.name}` : managedUser.teamId;
                  })() : '-'}</td>
                  <td>
                    <button
                      className="smallButton"
                      disabled={managedUser.id === user.id || busyUserId === managedUser.id}
                      onClick={async () => {
                        if (!token) {
                          return;
                        }

                        setBusyUserId(managedUser.id);
                        setMessage(null);

                        try {
                          await deleteUser(managedUser.id, token);
                          await mutateUsers();
                          setMessage(`Deleted user ${managedUser.username}.`);
                        } catch (deleteError) {
                          setMessage(deleteError instanceof Error ? deleteError.message : 'Unable to delete user.');
                        } finally {
                          setBusyUserId(null);
                        }
                      }}
                    >
                      {busyUserId === managedUser.id ? 'Deleting...' : 'Delete user'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message && <p className="muted">{message}</p>}
      </section>

      <section className="stack">
        <div className="panelHeader">
          <h2>Round Pages</h2>
          <Link className="smallButton" href="/rounds">Open rounds hub</Link>
        </div>
        <div className="gridCols">
          {overview.rounds.map((round) => {
            const matches = overview.matches.filter((match) => match.roundId === round.id);
            return (
              <article key={round.id} className="panelCard">
                <h3>{round.orderNumber}. {round.name}</h3>
                <p className="muted">{matches.length} matches</p>
                <div className="rowButtons">
                  <Link className="smallButton" href={`/rounds/${round.id}`}>Open round page</Link>
                </div>
                <div className="matchList compactList">
                  {matches.map((match) => (
                    <Link key={match.id} className="matchLinkRow" href={`/matches/${match.id}`}>
                      <span>{match.homeTeamId ? teamById.get(match.homeTeamId)?.name : 'TBD'} vs {match.awayTeamId ? teamById.get(match.awayTeamId)?.name : 'TBD'}</span>
                      <small>{match.status}</small>
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
