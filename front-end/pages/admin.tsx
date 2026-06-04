import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { useI18n } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import { getOverview, resetMatches, simulateRound } from '../services/competitionService';
import { deleteUser, listUsers } from '../services/authService';

export default function AdminPage() {
  const { t } = useI18n();
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
        <p className="eyebrow">{t('pageAdminArea')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">
          {isLoggedIn
            ? t('adminNotAuthorized')
            : t('adminLoginHint')}
        </p>
        {!isLoggedIn && <Link href="/login" className="linkButton">{t('goToLogin')}</Link>}
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">{t('adminLoadingWorkspace')}</p>;
  }

  if (error || !overview) {
    return <p className="errorText">{t('adminFailedLoadWorkspace')}</p>;
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
    const roundMatches = overview.matches.filter((match) => match.roundId === String(round.orderNumber));
    return roundMatches.some((match) => match.status === 'NOT_STARTED' || match.status === 'IN_PROGRESS');
  }) ?? (orderedRounds.find((round) => {
    const roundMatches = overview.matches.filter((match) => match.roundId === String(round.orderNumber));
    return roundMatches.some((match) => match.status === 'FINISHED');
  })) ?? null;

  const roundSummaries = orderedRounds.map((round) => {
    const roundMatches = overview.matches.filter((match) => match.roundId === String(round.orderNumber));
    const finishedMatches = roundMatches.filter((match) => match.status === 'FINISHED' || match.status === 'COMPLETED');
    const isCompleted = roundMatches.length > 0 && finishedMatches.length === roundMatches.length;

    return {
      round,
      matchCount: roundMatches.length,
      finishedCount: finishedMatches.length,
      isCompleted,
      isCurrentRound: currentRound?.orderNumber === round.orderNumber,
    };
  });

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">{t('adminTournamentManagement')}</p>
          <div className="tableWrap">
            <table>
              <tbody>
                <tr>
                  <td className="muted">{t('adminResetMatchesHint')}</td>
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
                            setMessage(t('adminResetSuccess', {
                              goals: result.goalsDeleted,
                              matches: result.firstRoundMatchesReset + result.futureRoundMatchesReset,
                            }));
                          } catch (resetError) {
                            setMessage(resetError instanceof Error ? resetError.message : t('adminUnableReset'));
                          } finally {
                            setResettingMatches(false);
                          }
                        }}
                      >
                        {resettingMatches ? t('actionResetting') : t('actionResetMatches')}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="panelCard stack">
          <p className="eyebrow">{t('adminRoundManagement')}</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colRound')}</th>
                  <th>{t('colMatches')}</th>
                  <th>{t('colFinished')}</th>
                  <th>{t('colCompleted')}</th>
                  <th>{t('colCurrentRound')}</th>
                  <th>{t('colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {roundSummaries.map(({ round, matchCount, finishedCount, isCompleted, isCurrentRound }) => (
                  <tr key={`round-${round.orderNumber}`}>
                    <td>{round.orderNumber}. {round.name}</td>
                    <td>{matchCount}</td>
                    <td>{finishedCount}/{matchCount}</td>
                    <td>{isCompleted ? t('labelYes') : t('labelNo')}</td>
                    <td>{isCurrentRound ? t('labelYes') : t('labelNo')}</td>
                    <td>
                      <button
                        className="smallButton"
                        disabled={!isCurrentRound || simulatingRoundId === String(round.orderNumber)}
                        onClick={async () => {
                          if (!token) {
                            return;
                          }

                          setSimulatingRoundId(String(round.orderNumber));
                          setMessage(null);

                          try {
                            await simulateRound(String(round.orderNumber), token);
                            await mutateOverview();
                            setMessage(t('adminSimulateSuccess', { round: round.name }));
                          } catch (simulationError) {
                            setMessage(simulationError instanceof Error ? simulationError.message : t('adminUnableSimulate'));
                          } finally {
                            setSimulatingRoundId(null);
                          }
                        }}
                      >
                        {simulatingRoundId === String(round.orderNumber) ? t('actionSimulating') : t('actionSimulateRound')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panelCard stack">
          <p className="eyebrow">{t('adminUserManagement')}</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colUsername')}</th>
                  <th>{t('colRole')}</th>
                  <th>{t('colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((managedUser) => (
                  <tr key={managedUser.username}>
                    <td>{managedUser.username}</td>
                    <td>{managedUser.role}</td>
                    <td>
                      <button
                        className="smallButton"
                        disabled={managedUser.username === user.username || busyUserId === managedUser.username}
                        onClick={async () => {
                          if (!token) {
                            return;
                          }

                          setBusyUserId(managedUser.username);
                          setMessage(null);

                          try {
                            await deleteUser(managedUser.username, token);
                            await mutateUsers();
                            setMessage(t('adminDeleteSuccess', { username: managedUser.username }));
                          } catch (deleteError) {
                            setMessage(deleteError instanceof Error ? deleteError.message : t('adminUnableDelete'));
                          } finally {
                            setBusyUserId(null);
                          }
                        }}
                      >
                        {busyUserId === managedUser.username ? t('actionDeleting') : t('actionDelete')}
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
