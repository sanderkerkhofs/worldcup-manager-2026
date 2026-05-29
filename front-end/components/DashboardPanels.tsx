import useSWR from 'swr';
import { useI18n } from '../lib/i18n';
import { getTopScorers } from '../services/competitionService';

export function ScorePanel({ token }: { token: string | null }) {
  const { t } = useI18n();
  const { data: topScorers } = useSWR(token ? ['topscorers', token] : 'topscorers-public', () => getTopScorers(token));

  return (
    <section className="stack">
      <article className="panelCard stack">
        <p className="eyebrow">{t('goalscoringLeaderboard')}</p>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{t('colPlayer')}</th>
                <th>{t('colTeam')}</th>
                <th>{t('colGoals')}</th>
              </tr>
            </thead>
            <tbody>
              {(topScorers ?? []).length > 0 ? (
                (topScorers ?? []).map((row) => (
                  <tr key={row.playerId}>
                    <td>{row.playerName}</td>
                    <td>{row.teamCountryFlag} {row.teamName}</td>
                    <td>{row.goals}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="tableEmptyCell">
                    <div className="tableEmptyState">
                      <strong className="tableEmptyTitle">{t('scorePanelNoScorersYet')}</strong>
                      <span className="tableEmptyHint">{t('scorePanelHint')}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
