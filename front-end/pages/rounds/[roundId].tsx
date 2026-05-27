import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
import { useI18n } from '../../lib/i18n';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { useSession } from '../../lib/useSession';
import { getOverview, simulateRound } from '../../services/competitionService';

export default function RoundDetailPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { roundId } = router.query;
  const { isAuthenticated, token, user } = useSession();
  const [busyAction, setBusyAction] = useState<'simulate' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canViewRound = isAuthenticated && user?.role !== 'GUEST';

  const { data: overview, error, isLoading, mutate } = useSWR(
    canViewRound && router.isReady && typeof roundId === 'string' ? ['round-detail', roundId, token ?? 'public'] : null,
    () => getOverview(token),
  );

  if (!canViewRound) {
    return (
      <section className="heroCard">
        <p className="eyebrow">{t('pageRounds')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">{t('roundsRestrictedHint')}</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">{t('goToLogin')}</Link>
          <Link href="/register" className="linkButton">{t('goToRegister')}</Link>
        </div>
      </section>
    );
  }

  if (!router.isReady) {
    return <p className="muted">{t('roundsLoading')}</p>;
  }

  if (isLoading) {
    return <p className="muted">{t('roundsLoading')}</p>;
  }

  if (error || !overview || typeof roundId !== 'string') {
    return <p className="errorText">{t('roundsUnableLoadDetails')}</p>;
  }

  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const round = orderedRounds.find((item) => item.id === roundId);

  if (!round) {
    return <p className="errorText">{t('roundsNotFound')}</p>;
  }

  const previousRound = orderedRounds.find((item) => item.orderNumber === round.orderNumber - 1);
  const previousMatches = previousRound ? overview.matches.filter((match) => match.roundId === previousRound.id) : [];
  const canManageRound = round.orderNumber === 1 || (previousMatches.length > 0 && previousMatches.every((match) => match.status === 'FINISHED' || match.status === 'COMPLETED'));

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const roundMatches = overview.matches
    .filter((match) => match.roundId === round.id)
    .sort((left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime());

  const isAdmin = user?.role === 'ADMIN' && !!token;

  return (
    <div className="stack">
      <section className="heroCard">
        <p className="eyebrow">{t('colRound')} {round.orderNumber}</p>
        <h2>{round.name}</h2>
        <p className="muted">{t('roundsMatchesInThisRound', { count: roundMatches.length })}</p>
        <div className="rowButtons">
          <Link className="linkButton" href="/rounds">{t('actionBackToAllRounds')}</Link>
          <Link className="linkButton" href="/matches">{t('actionOpenAllMatches')}</Link>
        </div>
      </section>

      {isAdmin && (
        <section className="panelCard stack">
          <div className="panelHeader">
            <h3>{t('adminControls')}</h3>
          </div>
          {!canManageRound && round.orderNumber > 1 && (
            <p className="muted">{t('roundsPreviousRoundMustFinish')}</p>
          )}
          {message && <p className="muted">{message}</p>}
          <div className="rowButtons">
            <button
              className="smallButton"
              disabled={!canManageRound || busyAction === 'simulate'}
              onClick={async () => {
                if (!token) return;
                setBusyAction('simulate');
                setMessage(null);
                try {
                  const result = await simulateRound(round.id, token);
                  await mutate();
                  setMessage(t('roundsSimulateSuccess', { matches: result.matches.length, goals: result.goalsCreated }));
                } catch (actionError) {
                  setMessage(actionError instanceof Error ? actionError.message : t('adminUnableSimulate'));
                } finally {
                  setBusyAction(null);
                }
              }}
            >
              {busyAction === 'simulate' ? t('actionSimulating') : t('actionSimulateRound')}
            </button>
          </div>
        </section>
      )}

      <section className="panelCard stack">
        <p className="eyebrow">{t('pageMatches')}</p>
        {roundMatches.length === 0 ? (
          <p className="muted">{t('roundsNoMatchesYet')}</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colFixture')}</th>
                  <th>{t('colDate')}</th>
                  <th>{t('colScore')}</th>
                  <th>{t('colStatus')}</th>
                  <th>{t('colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {roundMatches.map((match) => {
                  const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                  const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;
                  const homeName = homeTeam ? `${homeTeam.countryFlag} ${homeTeam.countryShortName}` : t('labelTBD');
                  const awayName = awayTeam ? `${awayTeam.countryFlag} ${awayTeam.countryShortName}` : t('labelTBD');

                  return (
                    <tr key={match.id}>
                      <td>{homeName} vs {awayName}</td>
                      <td>{new Date(match.matchDate).toLocaleString(locale)}</td>
                      <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                      <td>{getMatchStatusLabel(match.status, locale)}</td>
                      <td>
                        <Link href={`/matches/${match.id}`} className="linkButton">{t('actionOpenMatchEditor')}</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
