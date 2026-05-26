import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from '../lib/useSession';
import { getOverview, resetMatches, simulateRound } from '../services/competitionService';
import { deleteUser, listUsers } from '../services/authService';

export default function AdminPage() {
  const { token, user } = useSession();
  const { data: overview, error, isLoading, mutate: mutateOverview } = useSWR(token ? ['admin-overview', token] : null, () => getOverview(token));
  const { data: users, mutate: mutateUsers } = useSWR(token ? ['admin-users', token] : null, () => listUsers(token!));
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [simulatingRoundId, setSimulatingRoundId] = useState<string | null>(null);
  const [resettingMatches, setResettingMatches] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!token || user?.role !== 'ADMIN') {
    const isLoggedIn = Boolean(token && user);

    return (
      <section className="heroCard">
        <p className="eyebrow">Admin Area</p>
        <h2>Restricted access</h2>
        <p className="muted">
          {isLoggedIn
            ? 'Not authorised: only admins can access this page.'
            : 'Login as admin to manage matches and rounds.'}
        </p>
        {!isLoggedIn && <Link href="/login" className="linkButton">Go to login</Link>}
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">Loading admin workspace...</p>;
  }

  if (error || !overview) {
    return <p className="errorText">Failed to load admin workspace.</p>;
  }

  const sortedUsers = [...(users ?? [])].sort((left, right) => {
    const roleComparison = left.role.localeCompare(right.role);

    if (roleComparison !== 0) {
      return roleComparison;
    }

    return left.username.localeCompare(right.username);
  });

  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const currentRound = orderedRounds.find((round) => {
    const roundMatches = overview.matches.filter((match) => match.roundId === round.id);
    return roundMatches.some((match) => match.status === 'NOT_STARTED' || match.status === 'IN_PROGRESS' || match.status === 'FINISHED');
  }) ?? orderedRounds[orderedRounds.length - 1] ?? null;

  const roundSummaries = orderedRounds.map((round) => {
    const roundMatches = overview.matches.filter((match) => match.roundId === round.id);
    const finishedMatches = roundMatches.filter((match) => match.status === 'FINISHED' || match.status === 'COMPLETED');
    const isCompleted = roundMatches.length > 0 && finishedMatches.length === roundMatches.length;

    return {
      round,
      matchCount: roundMatches.length,
      finishedCount: finishedMatches.length,
      isCompleted,
      isCurrentRound: currentRound?.id === round.id,
    };
  });

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">Tournament Management</p>
          <div className="tableWrap">
            <table>
              <tbody>
                <tr>
                  <td className="muted">Reset all match scores and goals.</td>
                  <td className="tournamentActionCell">
                    <div className="rowButtons tournamentActions">
                      <button
                        className="smallButton"
                        disabled={resettingMatches}
                        onClick={async () => {
                          if (!token) {
                            return;
                          }

                          setResettingMatches(true);
                          setMessage(null);

                          try {
                            const result = await resetMatches(token);
                            await mutateOverview();
                            setMessage(`Tournament reset. Cleared ${result.goalsDeleted} goals and reset ${result.firstRoundMatchesReset + result.futureRoundMatchesReset} matches.`);
                          } catch (resetError) {
                            setMessage(resetError instanceof Error ? resetError.message : 'Unable to reset tournament matches.');
                          } finally {
                            setResettingMatches(false);
                          }
                        }}
                      >
                        {resettingMatches ? 'Resetting...' : 'Reset matches'}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="panelCard stack">
          <p className="eyebrow">Round Management</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Matches</th>
                  <th>Finished</th>
                  <th>Completed</th>
                  <th>Current round</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {roundSummaries.map(({ round, matchCount, finishedCount, isCompleted, isCurrentRound }) => (
                  <tr key={round.id}>
                    <td>{round.orderNumber}. {round.name}</td>
                    <td>{matchCount}</td>
                    <td>{finishedCount}/{matchCount}</td>
                    <td>{isCompleted ? 'Yes' : 'No'}</td>
                    <td>{isCurrentRound ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        className="smallButton"
                        disabled={!isCurrentRound || isCompleted || simulatingRoundId === round.id}
                        onClick={async () => {
                          if (!token) {
                            return;
                          }

                          setSimulatingRoundId(round.id);
                          setMessage(null);

                          try {
                            await simulateRound(round.id, token);
                            await mutateOverview();
                            setMessage(`Simulated ${round.name}.`);
                          } catch (simulationError) {
                            setMessage(simulationError instanceof Error ? simulationError.message : 'Unable to simulate round.');
                          } finally {
                            setSimulatingRoundId(null);
                          }
                        }}
                      >
                        {simulatingRoundId === round.id ? 'Simulating...' : 'Simulate round'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panelCard stack">
          <p className="eyebrow">User Management</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((managedUser) => (
                  <tr key={managedUser.id}>
                    <td>{managedUser.username}</td>
                    <td>{managedUser.role}</td>
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
                        {busyUserId === managedUser.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {message && <p className="muted">{message}</p>}
      </section>

    </div>
  );
}
