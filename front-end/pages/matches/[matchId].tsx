import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getMatchStatusLabel } from '../../lib/matchStatus';
import { useI18n } from '../../lib/i18n';
import { useSession } from '../../lib/useSession';
import { addGoal, getMatch, getOverview, getPlayers, updateMatchResult, updateMatchStatus } from '../../services/competitionService';
import { MatchStatus } from '../../types';

export default function MatchEditorPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { matchId } = router.query;
  const { isAuthenticated, token, user } = useSession();
  const isReady = typeof matchId === 'string';
  const canViewMatch = isAuthenticated && user?.role !== 'GUEST';

  const { data: overview } = useSWR(canViewMatch ? ['match-overview-public'] : null, () => getOverview());
  const { data: match, mutate: mutateMatch } = useSWR(canViewMatch && isReady ? ['match-public', matchId] : null, () => getMatch(matchId as string));
  const { data: homePlayers } = useSWR(canViewMatch && match?.homeTeamName ? ['players-home-public', match.homeTeamName] : null, () => getPlayers(match!.homeTeamName as string));
  const { data: awayPlayers } = useSWR(canViewMatch && match?.awayTeamName ? ['players-away-public', match.awayTeamName] : null, () => getPlayers(match!.awayTeamName as string));

  const [status, setStatus] = useState('PLANNED');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [homeGoalPlayerId, setHomeGoalPlayerId] = useState('');
  const [awayGoalPlayerId, setAwayGoalPlayerId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [goalMessages, setGoalMessages] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setHomeScore(match.homeScore?.toString() ?? '');
      setAwayScore(match.awayScore?.toString() ?? '');
    }
  }, [match]);

  const availablePlayers = useMemo(() => {
    return [...(homePlayers ?? []), ...(awayPlayers ?? [])];
  }, [awayPlayers, homePlayers]);

  const homeAvailablePlayers = useMemo(
    () => availablePlayers.filter((player) => player.teamName === match?.homeTeamName),
    [availablePlayers, match?.homeTeamName],
  );
  const awayAvailablePlayers = useMemo(
    () => availablePlayers.filter((player) => player.teamName === match?.awayTeamName),
    [availablePlayers, match?.awayTeamName],
  );

  if (!canViewMatch) {
    return (
      <section className="heroCard">
        <p className="eyebrow">{t('matchDetails')}</p>
        <h2>{t('restrictedAccessTitle')}</h2>
        <p className="muted">{t('matchRestrictedHint')}</p>
        <div className="rowButtons">
          <Link href="/login" className="linkButton">{t('goToLogin')}</Link>
          <Link href="/register" className="linkButton">{t('goToRegister')}</Link>
        </div>
      </section>
    );
  }

  if (!isReady) {
    return <p className="muted">{t('matchLoadingDetails')}</p>;
  }

  if (!match || !overview) {
    return <p className="muted">{t('matchLoadingDetails')}</p>;
  }

  const homeTeam = overview.teams.find((team) => team.name === match.homeTeamName);
  const awayTeam = overview.teams.find((team) => team.name === match.awayTeamName);
  const overviewMatch = overview.matches.find((item) => item.id === match.id);
  const isAdmin = user?.role === 'ADMIN';
  const isAssignedReferee = user?.role === 'REFEREE' && (match.refereeUsername === user?.username || overviewMatch?.refereeUsername === user?.username);
  const canEdit = isAdmin || isAssignedReferee;
  const isRefereeEditor = isAssignedReferee && !isAdmin;
  const hasPlayableTeams = !!match.homeTeamName && !!match.awayTeamName;
  const roundName = overview.rounds.find((round) => String(round.orderNumber) === match.roundId)?.name ?? t('colRound');
  const dateLabel = new Date(match.matchDate).toLocaleString(locale);
  const statusLabel = getMatchStatusLabel(match.status, locale);
  const canRefereeSetInProgress = hasPlayableTeams && (match.status === 'PLANNED' || match.status === 'NOT_STARTED');
  const canRefereeSetFinished = hasPlayableTeams && match.status === 'IN_PROGRESS';
  const scorerRows = match.goals ?? [];

  const changeRefereeStatus = async (nextStatus: 'IN_PROGRESS' | 'FINISHED') => {
    if (!token) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setMessage(null);
      await updateMatchStatus(match.id, nextStatus, token);
      setMessage(t('matchStatusUpdatedTo', { status: getMatchStatusLabel(nextStatus, locale) }));
      await mutateMatch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('matchStatusUpdateFailed'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const registerGoalForTeam = async (teamName: string | null, playerId: number, clearSelection: () => void) => {
    if (!token || !teamName || !playerId) {
      return;
    }

    const scorer = availablePlayers.find((player) => player.id === playerId);

    if (!scorer) {
      return;
    }

    await addGoal(match.id, {
      playerId,
      teamName,
    }, token);

    const scorerName = `${scorer.firstName} ${scorer.lastName}`;
    const scoringTeamName = teamName === match.homeTeamName
      ? (homeTeam?.name ?? t('labelHomeTeam'))
      : (awayTeam?.name ?? t('labelAwayTeam'));

    setGoalMessages((current) => [t('goalSavedMessage', { scorer: scorerName, team: scoringTeamName }), ...current].slice(0, 4));
    clearSelection();
    await mutateMatch();
  };

  return (
    <div className="matchEditorLayout">
      <section className="panelCard matchOverviewCard stack">
        <p className="eyebrow">{t('matchDetailsInfo')}</p>
        <h2>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : t('labelHome')} vs {awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : t('labelAway')}</h2>
        <div className="matchInfoSplit">
          <div className="matchInfoBlock">
            <h4>{t('preGameInfo')}</h4>
            <div className="matchMetaGrid">
              <article className="matchMetaItem">
                <p className="matchMetaLabel">{t('colRound')}</p>
                <p className="matchMetaValue">{roundName}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">{t('colDate')}</p>
                <p className="matchMetaValue">{dateLabel}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">{t('colReferee')}</p>
                <p className="matchMetaValue">{overviewMatch?.refereeName ?? t('labelUnassigned')}</p>
              </article>
            </div>
          </div>

          <div className="matchInfoBlock">
            <h4>{t('matchDetailsBlock')}</h4>
            <div className="matchMetaGrid">
              <article className="matchMetaItem">
                <p className="matchMetaLabel">{t('colStatus')}</p>
                <p className="matchMetaValue">{statusLabel}</p>
              </article>
              <article className="matchMetaItem">
                <p className="matchMetaLabel">{t('labelCurrentScore')}</p>
                <p className="matchMetaValue">{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
              </article>
            </div>
            <div className="scorerListCard">
              <p className="matchMetaLabel">{t('playersWhoScored')}</p>
              {scorerRows.length === 0 ? (
                <p className="muted">{t('noGoalsRecorded')}</p>
              ) : (
                <ul className="scorerList">
                  {scorerRows.map((goal, index) => (
                    <li key={goal.id}>
                      <span>{index + 1}. {goal.teamCountryFlag} {goal.playerName}</span>
                      <small>{goal.teamName}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {!hasPlayableTeams && <p className="muted">{t('teamsNotAssignedYet')}</p>}
      </section>

      {canEdit && (
        <section className="panelCard matchOverviewCard stack">
          <p className="eyebrow">{t('editMatch')}</p>
          <h3>{t('matchStatusAndScore')}</h3>
          <p className="muted">{t('matchEditPermissionHint')}</p>
          <hr className="matchSectionDivider" />
          <div className="matchEditBlock">
            <div className="matchEditHeader">
              <h4>{t('editMatchStatus')}</h4>
            </div>
            {isRefereeEditor ? (
              <div className="rowButtons statusActionRow">
                <button
                  className="smallButton"
                  disabled={!canRefereeSetInProgress || isUpdatingStatus}
                  onClick={async () => {
                    await changeRefereeStatus('IN_PROGRESS');
                  }}
                >
                  {t('actionSetInProgress')}
                </button>
                <button
                  className="smallButton"
                  disabled={!canRefereeSetFinished || isUpdatingStatus}
                  onClick={async () => {
                    await changeRefereeStatus('FINISHED');
                  }}
                >
                  {t('actionSetFinished')}
                </button>
              </div>
            ) : (
              <>
                <div className="formGrid">
                  <label>
                    {t('labelMatchStatus')}
                    <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!hasPlayableTeams || status === 'FINISHED'}>
                      <option value="PLANNED">{getMatchStatusLabel('PLANNED' as MatchStatus, locale)}</option>
                      <option value="NOT_STARTED">{getMatchStatusLabel('NOT_STARTED' as MatchStatus, locale)}</option>
                      <option value="IN_PROGRESS">{getMatchStatusLabel('IN_PROGRESS' as MatchStatus, locale)}</option>
                      <option value="FINISHED">{getMatchStatusLabel('FINISHED' as MatchStatus, locale)}</option>
                    </select>
                  </label>
                  <label>
                    {t('labelHomeScore')}
                    <input type="number" min={0} value={homeScore} onChange={(event) => setHomeScore(event.target.value)} disabled={!hasPlayableTeams || status === 'FINISHED'} />
                  </label>
                  <label>
                    {t('labelAwayScore')}
                    <input type="number" min={0} value={awayScore} onChange={(event) => setAwayScore(event.target.value)} disabled={!hasPlayableTeams || status === 'FINISHED'} />
                  </label>
                </div>
                <div className="rowButtons">
                  <button
                    className="smallButton"
                    disabled={!hasPlayableTeams || status === 'FINISHED'}
                    onClick={async () => {
                      if (!token) return;
                      setMessage(null);
                      await updateMatchStatus(match.id, status as 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED', token);
                      if (homeScore !== '' && awayScore !== '') {
                        await updateMatchResult(match.id, Number(homeScore), Number(awayScore), token);
                      }
                      setMessage(t('matchUpdatedSuccessfully'));
                      await mutateMatch();
                    }}
                  >
                    {t('actionSaveMatch')}
                  </button>
                </div>
              </>
            )}
            {message && <p className="muted">{message}</p>}
          </div>

          <hr className="matchSectionDivider" />
          <div className="matchEditBlock">
            <div className="matchEditHeader">
              <h4>{t('recordGoalScorer')}</h4>
              <p className="muted">{t('goalScorerHint')}</p>
            </div>
            <div className="goalSplitGrid">
              <article className="goalTeamCard">
                <div className="goalTeamHeader">
                  <h5>{homeTeam ? `${homeTeam.countryFlag} ${homeTeam.name}` : t('labelHomeTeam')}</h5>
                  <p className="goalTeamScore">{t('colScore')}: {match.homeScore ?? 0}</p>
                </div>
                <label>
                  {t('labelHomePlayers')}
                  <select
                    value={homeGoalPlayerId}
                    onChange={(event) => setHomeGoalPlayerId(event.target.value)}
                    disabled={!hasPlayableTeams}
                  >
                    <option value="">{t('optionSelectPlayer')}</option>
                    {homeAvailablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} #{player.shirtNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="smallButton"
                  disabled={!hasPlayableTeams || !homeGoalPlayerId}
                  onClick={async () => {
                    await registerGoalForTeam(match.homeTeamName, parseInt(homeGoalPlayerId, 10), () => setHomeGoalPlayerId(''));
                  }}
                >
                  {t('actionAddHomeGoal')}
                </button>
              </article>

              <article className="goalTeamCard">
                <div className="goalTeamHeader">
                  <h5>{awayTeam ? `${awayTeam.countryFlag} ${awayTeam.name}` : t('labelAwayTeam')}</h5>
                  <p className="goalTeamScore">{t('colScore')}: {match.awayScore ?? 0}</p>
                </div>
                <label>
                  {t('labelAwayPlayers')}
                  <select
                    value={awayGoalPlayerId}
                    onChange={(event) => setAwayGoalPlayerId(event.target.value)}
                    disabled={!hasPlayableTeams}
                  >
                    <option value="">{t('optionSelectPlayer')}</option>
                    {awayAvailablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} #{player.shirtNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="smallButton"
                  disabled={!hasPlayableTeams || !awayGoalPlayerId}
                  onClick={async () => {
                    await registerGoalForTeam(match.awayTeamName, parseInt(awayGoalPlayerId, 10), () => setAwayGoalPlayerId(''));
                  }}
                >
                  {t('actionAddAwayGoal')}
                </button>
              </article>
            </div>
            {goalMessages.length > 0 && (
              <ul className="messageList">
                {goalMessages.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
