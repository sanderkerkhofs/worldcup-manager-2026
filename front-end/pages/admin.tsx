import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../lib/useSession';
import { getMatchStatusLabel } from '../lib/matchStatus';
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
  const sortedUsers = [...(users ?? [])].sort((left, right) => {
    const roleComparison = left.role.localeCompare(right.role);

    if (roleComparison !== 0) {
      return roleComparison;
    }

    return left.username.localeCompare(right.username);
  });

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">User Management</p>
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
                {sortedUsers.map((managedUser) => (
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
                        {busyUserId === managedUser.id ? 'Deleting...' : <span className="iconLabel"><FontAwesomeIcon icon={faTrashCan} /> Delete</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {message && <p className="muted">{message}</p>}
        </article>
      </section>

      <section className="stack">
        <header className="sectionTitleCard">
          <div className="sectionTitleCopy">
            <p className="eyebrow">Navigation</p>
            <h2>Round Pages</h2>
          </div>
          <div className="rowButtons">
            <Link className="smallButton" href="/rounds">Open rounds hub</Link>
          </div>
        </header>
        <div className="gridCols">
          {overview.rounds.map((round) => {
            const matches = overview.matches.filter((match) => match.roundId === round.id);
            return (
              <article key={round.id} className="panelCard">
                <h3>{round.orderNumber}. {round.name}</h3>
                <p className="muted">{matches.length} matches</p>
                <div className="rowButtons">
                </div>
                <div className="matchList compactList">
                  {matches.map((match) => (
                    <Link key={match.id} className="matchLinkRow" href={`/matches/${match.id}`}>
                      <span>{match.homeTeamId ? teamById.get(match.homeTeamId)?.name : 'TBD'} vs {match.awayTeamId ? teamById.get(match.awayTeamId)?.name : 'TBD'}</span>
                      <small>{getMatchStatusLabel(match.status)}</small>
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
