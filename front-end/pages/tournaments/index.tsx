import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { AuthGate } from '../../components/AuthGate';
import { SectionCard } from '../../components/SectionCard';
import { TournamentForm } from '../../components/TournamentForm';
import { createTournament, deleteTournament, listTournaments } from '../../services/tournamentService';
import { useSession } from '../../lib/useSession';
import { useT } from '../../lib/i18n';

export default function TournamentListPage() {
    const t = useT();
    const { session } = useSession();
    const { data, error, isLoading, mutate } = useSWR('tournaments', listTournaments);
    const [actionError, setActionError] = useState<string | null>(null);

    async function handleCreateTournament(input: Parameters<typeof createTournament>[0]) {
        try {
            await createTournament(input);
            await mutate();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to create tournament.');
        }
    }

    async function handleDeleteTournament(tournamentId: string) {
        try {
            await deleteTournament(tournamentId);
            await mutate();
            setActionError(null);
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Failed to delete tournament.');
        }
    }

    return (
        <AuthGate>
            <div className="dashboard-grid">
                <SectionCard title={t('tournaments.title')} accent="hero-panel">
                    {error ? <p className="error-banner">{String(error)}</p> : null}
                    {actionError ? <p className="error-banner">{actionError}</p> : null}
                    {isLoading ? <p className="status-copy">{t('common.loading')}</p> : null}
                    {!isLoading && data?.length ? (
                        <div className="stack-list">
                            {data.map((tournament) => (
                                <article key={tournament.id} className="list-item">
                                    <div>
                                        <h3>{tournament.name}</h3>
                                        <p>{tournament.year} · {tournament.format}</p>
                                    </div>
                                    <div className="row-actions">
                                        <Link className="secondary-button" href={`/tournaments/${tournament.id}`}>Open</Link>
                                        {session?.user.role !== 'VIEWER' ? (
                                            <button className="danger-button" onClick={() => handleDeleteTournament(tournament.id)}>{t('tournaments.delete')}</button>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : null}
                    {!isLoading && data?.length === 0 ? <p className="status-copy">{t('tournaments.empty')}</p> : null}
                </SectionCard>

                {session?.user.role !== 'VIEWER' ? (
                    <SectionCard title={t('tournaments.create')}>
                        <TournamentForm onCreate={handleCreateTournament} />
                    </SectionCard>
                ) : null}
            </div>
        </AuthGate>
    );
}