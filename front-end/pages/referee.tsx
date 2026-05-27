import Link from 'next/link';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../lib/matchStatus';
import { useI18n } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import { getOverview } from '../services/competitionService';

export default function RefereePage() {
  const { locale, t } = useI18n();
  const { token, user } = useSession();
  const { data: overview, isLoading } = useSWR(token ? ['referee-overview', token] : null, () => getOverview(token));

  if (!token || user?.role !== 'REFEREE') {
    const isLoggedIn = Boolean(token && user);

    return (
      <section className="heroCard">
        <p className="eyebrow">{t('pageRefereeArea')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">
          {isLoggedIn
            ? t('refereeNotAuthorized')
            : t('refereeLoginHint')}
        </p>
        {!isLoggedIn && <Link href="/login" className="linkButton">{t('goToLogin')}</Link>}
      </section>
    );
  }

  if (isLoading || !overview) {
    return <p className="muted">{t('refereeLoadingWorkspace')}</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));
  const assignedMatches = overview.matches.filter((match) => match.refereeId === user.id);
  const assignedMatchesHeading = `${t('refereeAssignedMatches')} (${user.username})`;

  return (
    <div className="stack">
      <section className="panelCard stack">
        <header className="sectionTitleCard sectionTitleCardPlain">
          <div className="sectionTitleCopy">
            <p className="eyebrow">{assignedMatchesHeading}</p>
          </div>
        </header>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{t('colRound')}</th>
                <th>{t('colFixture')}</th>
                <th>{t('colDate')}</th>
                <th>{t('colScore')}</th>
                <th>{t('colStatus')}</th>
                <th>{t('colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {assignedMatches.map((match) => {
                const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
                const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

                return (
                  <tr key={match.id}>
                    <td>{match.roundName}</td>
                    <td>
                      {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : t('labelTBD')} vs{' '}
                      {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : t('labelTBD')}
                    </td>
                    <td>{new Date(match.matchDate).toLocaleString(locale)}</td>
                    <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                    <td>{getMatchStatusLabel(match.status, locale)}</td>
                    <td>
                      <Link href={`/matches/${match.id}`} className="linkButton">{t('actionOpenMatchPage')}</Link>
                    </td>
                  </tr>
                );
              })}
              {assignedMatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="tableEmptyCell">
                    <p className="muted">{t('refereeNoAssignedMatches')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
