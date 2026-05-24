import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { AuthGate } from '../../components/AuthGate';
import { SectionCard } from '../../components/SectionCard';
import {
    createMatch,
    createRound,
    deleteTournament,
    getTournamentOverview,
    listTeams,
    registerTeam,
    removeTeam,
    updateMatchResult,
} from '../../services/tournamentService';
import { useSession } from '../../lib/useSession';
import { useT } from '../../lib/i18n';
import { Match, Team, TournamentOverview } from '../../types';

type ScoreState = {
    homeScore: string;
    awayScore: string;
};

export default function TournamentDetailPage() {
    const router = useRouter();
    const t = useT();
    const { session } = useSession();
    const id = typeof router.query.id === 'string' ? router.query.id : undefined;
    const { data, error, isLoading, mutate } = useSWR<TournamentOverview>(id ? ['tournament-overview', id] : null, () => getTournamentOverview(id!));
    const { data: availableTeams } = useSWR('all-teams', listTeams);
    const [teamId, setTeamId] = useState('');
    const [roundName, setRoundName] = useState('Group stage');
    const [roundOrder, setRoundOrder] = useState('1');
    const [matchRoundId, setMatchRoundId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 16));
    const [scores, setScores] = useState<Record<string, ScoreState>>({});
    const [actionError, setActionError] = useState<string | null>(null);

    function handleTeamSelectionChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setTeamId(event.target.value);
    }

    function handleRoundNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setRoundName(event.target.value);
    }

    function handleRoundOrderChange(event: React.ChangeEvent<HTMLInputElement>) {
        setRoundOrder(event.target.value);
    }

    function handleMatchRoundChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setMatchRoundId(event.target.value);
    }

    function handleHomeTeamChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setHomeTeamId(event.target.value);
    }

    function handleAwayTeamChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setAwayTeamId(event.target.value);
    }

    function handleMatchDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMatchDate(event.target.value);
    }

    function handleHomeScoreChange(matchId: string, event: React.ChangeEvent<HTMLInputElement>) {
        const currentScore = scores[matchId] ?? { homeScore: '', awayScore: '' };

        setScores((current) => ({
            ...current,
            [matchId]: {
                homeScore: event.target.value,
                awayScore: currentScore.awayScore,
            },
        }));
    }

    function handleAwayScoreChange(matchId: string, event: React.ChangeEvent<HTMLInputElement>) {
        const currentScore = scores[matchId] ?? { homeScore: '', awayScore: '' };

        setScores((current) => ({
            ...current,
            [matchId]: {
                homeScore: currentScore.homeScore,
                awayScore: event.target.value,
            },
        }));
    }

    function handleHomeScoreChangeFor(matchId: string) {
        return (event: React.ChangeEvent<HTMLInputElement>) => handleHomeScoreChange(matchId, event);
    }

    function handleAwayScoreChangeFor(matchId: string) {
        return (event: React.ChangeEvent<HTMLInputElement>) => handleAwayScoreChange(matchId, event);
    }

    useEffect(() => {
        if (data?.rounds?.length && !matchRoundId) {
            setMatchRoundId(data.rounds[0].id);
        }

        if (data?.teams?.length && !homeTeamId) {
            setHomeTeamId(data.teams[0].id);
        }

        if (data?.teams?.length && !awayTeamId) {
            setAwayTeamId(data.teams[1]?.id ?? data.teams[0].id);
        }
    }, [data, matchRoundId, homeTeamId, awayTeamId]);

    const canManage = session?.user.role !== 'VIEWER';

    const teamOptions = useMemo<Team[]>(() => availableTeams ?? [], [availableTeams]);

    async function refresh() {
        await mutate();
    }

    async function handleRegisterTeam() {
        if (!id || !teamId) {
            return;
        }

        try {
            await registerTeam(id, teamId);
            await refresh();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to register team.');
        }
    }

    async function handleRemoveTeam(teamToRemoveId: string) {
        if (!id) {
            return;
        }

        try {
            await removeTeam(id, teamToRemoveId);
            await refresh();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to remove team.');
        }
    }

    async function handleCreateRound() {
        if (!id) {
            return;
        }

        try {
            await createRound(id, {
                name: roundName,
                orderNumber: Number(roundOrder),
            });
            await refresh();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to create round.');
        }
    }

    async function handleCreateMatch() {
        if (!id) {
            return;
        }

        try {
            await createMatch(id, {
                roundId: matchRoundId,
                homeTeamId,
                awayTeamId,
                matchDate: new Date(matchDate).toISOString(),
            });
            await refresh();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to create match.');
        }
    }

    async function handleUpdateResult(matchId: string) {
        const result = scores[matchId];

        if (!result) {
            return;
        }

        try {
            await updateMatchResult(matchId, {
                homeScore: Number(result.homeScore),
                awayScore: Number(result.awayScore),
                status: 'COMPLETED',
            });
            await refresh();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to update result.');
        }
    }

    async function handleDeleteTournament() {
        if (!id) {
            return;
        }

        try {
            await deleteTournament(id);
            await router.push('/tournaments');
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to delete tournament.');
        }
    }

    if (!id) {
        return <p className="status-copy">Invalid tournament id.</p>;
    }

    return (
        <AuthGate>
            {isLoading ? <p className="status-copy">{t('common.loading')}</p> : null}
            {error ? <p className="error-banner">{String(error)}</p> : null}
            {actionError ? <p className="error-banner">{actionError}</p> : null}
            {data ? (
                <div className="detail-grid">
                    <SectionCard title={`${data.tournament.name} · ${data.tournament.year}`} accent="hero-panel">
                        <p>{data.tournament.format}</p>
                        <div className="row-actions">
                            {canManage ? <button className="danger-button" onClick={handleDeleteTournament}>{t('tournaments.delete')}</button> : null}
                        </div>
                    </SectionCard>

                    <SectionCard title={t('tournaments.teams')}>
                        <div className="inline-form compact">
                            <label>
                                <span>Team</span>
                                <select value={teamId} onChange={handleTeamSelectionChange}>
                                    {teamOptions.map((team) => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" onClick={handleRegisterTeam}>{t('tournaments.addTeam')}</button>
                        </div>
                        <div className="stack-list">
                            {data.teams.map((team) => (
                                <article className="list-item" key={team.id}>
                                    <div>
                                        <h3>{team.name}</h3>
                                        <p>{team.country} · {team.coach}</p>
                                    </div>
                                    <button className="danger-button" onClick={() => handleRemoveTeam(team.id)}>{t('tournaments.removeTeam')}</button>
                                </article>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title={t('tournaments.rounds')}>
                        {canManage ? (
                            <div className="inline-form compact">
                                <label>
                                    <span>Name</span>
                                    <input value={roundName} onChange={handleRoundNameChange} />
                                </label>
                                <label>
                                    <span>Order</span>
                                    <input value={roundOrder} onChange={handleRoundOrderChange} />
                                </label>
                                <button type="button" onClick={handleCreateRound}>Create round</button>
                            </div>
                        ) : null}
                        <div className="stack-list">
                            {data.rounds.map((round) => (
                                <article className="list-item" key={round.id}>
                                    <div>
                                        <h3>{round.name}</h3>
                                        <p>#{round.orderNumber}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title={t('tournaments.matches')}>
                        {canManage ? (
                            <div className="inline-form compact">
                                <label>
                                    <span>Round</span>
                                    <select value={matchRoundId} onChange={handleMatchRoundChange}>
                                        {data.rounds.map((round) => (
                                            <option key={round.id} value={round.id}>{round.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span>Home</span>
                                    <select value={homeTeamId} onChange={handleHomeTeamChange}>
                                        {data.teams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span>Away</span>
                                    <select value={awayTeamId} onChange={handleAwayTeamChange}>
                                        {data.teams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span>Date</span>
                                    <input type="datetime-local" value={matchDate} onChange={handleMatchDateChange} />
                                </label>
                                <button type="button" onClick={handleCreateMatch}>Create match</button>
                            </div>
                        ) : null}
                        <div className="stack-list">
                            {data.matches.map((match) => (
                                <article className="list-item" key={match.id}>
                                    <div>
                                        <h3>{match.homeTeamId} vs {match.awayTeamId}</h3>
                                        <p>{new Date(match.matchDate).toLocaleString()} · {match.status}</p>
                                    </div>
                                    {canManage ? (
                                        <div className="inline-form compact score-form">
                                            <label>
                                                <span>Home</span>
                                                <input value={scores[match.id]?.homeScore ?? ''} onChange={handleHomeScoreChangeFor(match.id)} />
                                            </label>
                                            <label>
                                                <span>Away</span>
                                                <input value={scores[match.id]?.awayScore ?? ''} onChange={handleAwayScoreChangeFor(match.id)} />
                                            </label>
                                            <button type="button" onClick={() => handleUpdateResult(match.id)}>Save result</button>
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title={t('tournaments.standings')}>
                        <table className="standings-table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>GF</th>
                                    <th>GA</th>
                                    <th>GD</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.standings.map((row) => (
                                    <tr key={row.teamId}>
                                        <td>{row.teamName}</td>
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
                    </SectionCard>
                </div>
            ) : null}
        </AuthGate>
    );
}