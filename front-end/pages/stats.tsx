import Link from 'next/link';
import useSWR from 'swr';
import { ScorePanel } from '../components/DashboardPanels';
import { useSession } from '../lib/useSession';
import { useI18n } from '../lib/i18n';
import { getOverview } from '../services/competitionService';

export default function StatsPage() {
  const { isAuthenticated, user, token } = useSession();
  const { t } = useI18n();
  const { data: overview, error, isLoading } = useSWR(['stats-overview', token ?? 'public'], () => getOverview(token));

  if (!isAuthenticated || user?.role === 'GUEST') {
    return (
      <section className="heroCard">
        <p className="eyebrow">{t('goalscoringLeaderboard')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">{t('statsRestrictedHint')}</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">{t('goToLogin')}</Link>
          <Link href="/register" className="linkButton">{t('goToRegister')}</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <p className="muted">{t('statsLoading')}</p>;
  }

  if (error || !overview) {
    return <p className="errorText">{t('statsUnableToLoad')}</p>;
  }

  const teamById = new Map(overview.teams.map((team) => [team.id, team]));

  return (
    <div className="stack">
      <section className="stack">
        <article className="panelCard stack">
          <p className="eyebrow">{t('tournamentStandings')}</p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colTeam')}</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>{t('colGF')}</th>
                  <th>{t('colGA')}</th>
                  <th>{t('colGD')}</th>
                  <th>{t('colPTS')}</th>
                </tr>
              </thead>
              <tbody>
                {overview.standings.map((row) => (
                  <tr key={row.teamId}>
                    <td>{teamById.get(row.teamId)?.countryFlag ? `${teamById.get(row.teamId)?.countryFlag} ` : ''}{row.teamName}</td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <ScorePanel token={token} />
    </div>
  );
}