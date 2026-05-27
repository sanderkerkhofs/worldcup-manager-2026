import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../lib/matchStatus';
import { useI18n } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import {
  getRounds,
  getTopScorers,
  simulateRound,
  updateMatchResult,
  updateMatchStatus,
} from '../services/competitionService';
import { CompetitionOverview, Match, Round } from '../types';

type Props = {
  overview: CompetitionOverview;
  token: string | null;
  onRefresh: () => Promise<void>;
};

function RoundCard({ round, matches, canManageRound, blockedReason, token, onRefresh }: {
  round: Round;
  matches: Match[];
  canManageRound: boolean;
  blockedReason?: string;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [simulating, setSimulating] = useState(false);
  const { t } = useI18n();

  return (
    <article className="panelCard">
      <div className="panelHeader">
        <h3>{round.orderNumber}. {round.name}</h3>
        <div className="rowButtons">
          <button
            className="smallButton"
            disabled={!canManageRound || simulating}
            onClick={async () => {
              setSimulating(true);
              try {
                await simulateRound(round.id, token);
                await onRefresh();
              } finally {
                setSimulating(false);
              }
            }}
          >
            {simulating ? t('actionSimulating') : t('actionSimulateRound')}
          </button>
        </div>
      </div>
      <p className="muted">{t('pageMatches')}: {matches.length}</p>
      {!canManageRound && blockedReason && <p className="muted">{blockedReason}</p>}
    </article>
  );
}

function isRoundManageable(overview: CompetitionOverview, round: Round) {
  if (round.orderNumber === 1) {
    return true;
  }

  const previousRound = overview.rounds.find((candidate) => candidate.orderNumber === round.orderNumber - 1);

  if (!previousRound) {
    return false;
  }

  const previousMatches = overview.matches.filter((match) => match.roundId === previousRound.id);

  if (previousMatches.length === 0) {
    return false;
  }

  return previousMatches.every((match) => match.status === 'FINISHED' || match.status === 'COMPLETED');
}

export function AdminPanel({ overview, token, onRefresh }: Props) {
  const { t } = useI18n();
  const { data: rounds } = useSWR(token ? ['rounds', token] : null, () => getRounds(token));

  if (!token) {
    return null;
  }

  return (
    <section className="stack">
      <header className="sectionTitleCard">
        <div className="sectionTitleCopy">
          <p className="eyebrow">{t('navAdmin')}</p>
          <h2>{t('adminControls')}</h2>
        </div>
      </header>
      <div className="gridCols">
        {(rounds ?? overview.rounds).map((round) => {
          const canManageRound = isRoundManageable(overview, round);
          const blockedReason = round.orderNumber > 1 && !canManageRound
            ? t('roundsPreviousRoundMustFinish')
            : undefined;

          return (
            <RoundCard
              key={round.id}
              round={round}
              matches={overview.matches.filter((match) => match.roundId === round.id)}
              canManageRound={canManageRound}
              blockedReason={blockedReason}
              token={token}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>
    </section>
  );
}

export function RefereePanel({ overview, token, onRefresh }: Props) {
  const { user } = useSession();
  const { locale, t } = useI18n();
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: string; away: string }>>({});

  const assignedMatches = useMemo(
    () => overview.matches.filter((match) => match.refereeId === user?.id),
    [overview.matches, user?.id],
  );

  if (!token) {
    return null;
  }

  return (
    <section className="stack">
      <header className="sectionTitleCard">
        <div className="sectionTitleCopy">
          <p className="eyebrow">{t('navReferee')}</p>
          <h2>{t('refereeControls')}</h2>
        </div>
      </header>
      {assignedMatches.length === 0 ? (
        <p className="muted">{t('refereeNoAssignedMatches')}</p>
      ) : (
        <div className="gridCols">
          {assignedMatches.map((match) => {
            const homeTeam = match.homeTeamId ? (overview.teams.find((team) => team.id === match.homeTeamId)?.name ?? t('labelTBD')) : t('labelTBD');
            const awayTeam = match.awayTeamId ? (overview.teams.find((team) => team.id === match.awayTeamId)?.name ?? t('labelTBD')) : t('labelTBD');
            const hasPlayableTeams = !!match.homeTeamId && !!match.awayTeamId;
            const input = scoreInputs[match.id] ?? { home: '', away: '' };

            return (
              <article key={match.id} className="panelCard">
                <h3>{homeTeam} vs {awayTeam}</h3>
                <p className="muted">{t('colStatus')}: {getMatchStatusLabel(match.status, locale)}</p>
                <div className="rowButtons">
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'IN_PROGRESS', token); await onRefresh(); }}>{t('actionSetInProgress')}</button>
                  <button className="smallButton" disabled={!hasPlayableTeams} onClick={async () => { await updateMatchStatus(match.id, 'FINISHED', token); await onRefresh(); }}>{t('actionSetFinished')}</button>
                </div>
                <div className="scoreInputs">
                  <input
                    type="number"
                    min={0}
                    placeholder={t('labelHome')}
                    value={input.home}
                    disabled={!hasPlayableTeams}
                    onChange={(event) => setScoreInputs((current) => ({
                      ...current,
                      [match.id]: { ...input, home: event.target.value },
                    }))}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder={t('labelAway')}
                    value={input.away}
                    disabled={!hasPlayableTeams}
                    onChange={(event) => setScoreInputs((current) => ({
                      ...current,
                      [match.id]: { ...input, away: event.target.value },
                    }))}
                  />
                  <button
                    className="smallButton"
                    disabled={!hasPlayableTeams}
                    onClick={async () => {
                      const home = Number(input.home);
                      const away = Number(input.away);

                      if (Number.isNaN(home) || Number.isNaN(away)) {
                        return;
                      }

                      await updateMatchResult(match.id, home, away, token);
                      await onRefresh();
                    }}
                  >
                    {t('actionSaveMatch')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

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
