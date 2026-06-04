import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from '../../lib/useSession';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { getOverview } from '../../services/competitionService';
import { useI18n } from '../../lib/i18n';

export default function MatchesPage() {
  const { isAuthenticated, user } = useSession();
  const { locale, t } = useI18n();
  const { data: overview, error, isLoading } = useSWR(['matches-overview-public'], () => getOverview());

  if (!isAuthenticated || user?.role === 'GUEST') {
    return (
      <section className="heroCard">
        <p className="eyebrow">{t('pageMatches')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">{t('matchesRestrictedHint')}</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">{t('goToLogin')}</Link>
          <Link href="/register" className="linkButton">{t('goToRegister')}</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">{t('matchesLoading')}</p>;
  }

  if (error || !overview) {
    return <p className="errorText">{t('matchesUnableToLoad')}</p>;
  }

  const teamByName = new Map(overview.teams.map((team) => [team.name, team]));
  const orderedRounds = [...overview.rounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const roundsWithMatches = orderedRounds
    .map((round) => ({
      round,
      matches: overview.matches
        .filter((match) => match.roundId === String(round.orderNumber))
        .sort((left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime()),
    }))
    .filter((item) => item.matches.length > 0);

  return (
    <div className="stack">
      {roundsWithMatches.length === 0 ? (
        <section className="panelCard">
          <p className="muted">{t('matchesNoAvailable')}</p>
        </section>
      ) : (
        roundsWithMatches.map(({ round, matches }) => (
          <section key={`round-${round.orderNumber}`}>
            <article className="panelCard stack">
              <header className="sectionTitleCard sectionTitleCardPlain">
                <div className="sectionTitleCopy">
                  <p className="eyebrow">{t('roundLabel')} {round.orderNumber} - {round.name}</p>
                </div>
              </header>

              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('colFixture')}</th>
                      <th>{t('colDate')}</th>
                      <th>{t('colReferee')}</th>
                      <th>{t('colScore')}</th>
                      <th>{t('colStatus')}</th>
                      <th>{t('colAction')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => {
                      const homeTeam = match.homeTeamName ? teamByName.get(match.homeTeamName) : undefined;
                      const awayTeam = match.awayTeamName ? teamByName.get(match.awayTeamName) : undefined;

                      return (
                        <tr key={match.id}>
                          <td>
                            {homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : t('labelTBD')} vs{' '}
                            {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : t('labelTBD')}
                          </td>
                          <td>{new Date(match.matchDate).toLocaleString(locale)}</td>
                          <td>{match.refereeName ?? t('labelUnassigned')}</td>
                          <td>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</td>
                          <td>{getMatchStatusLabel(match.status, locale)}</td>
                          <td>
                            <Link href={`/matches/${match.id}`} className="linkButton">{t('actionOpenMatch')}</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ))
      )}
    </div>
  );
}