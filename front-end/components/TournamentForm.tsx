import { FormEvent, useState } from 'react';
import { TournamentInput } from '@types';
import { useT } from '../lib/i18n';

export function TournamentForm({ onCreate }: { onCreate: (input: TournamentInput) => Promise<void>; }) {
    const t = useT();
    const [name, setName] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [format, setFormat] = useState('League');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!name.trim() || !format.trim()) {
            setError(t('auth.errorRequired'));
            return;
        }

        const parsedYear = Number(year);
        if (Number.isNaN(parsedYear)) {
            setError('Year must be a number.');
            return;
        }

        setError(null);
        await onCreate({ name, year: parsedYear, format });
        setName('');
        setFormat('League');
        setYear(new Date().getFullYear().toString());
    }

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <label>
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
                <span>Year</span>
                <input value={year} onChange={(event) => setYear(event.target.value)} />
            </label>
            <label>
                <span>Format</span>
                <input value={format} onChange={(event) => setFormat(event.target.value)} />
            </label>
            {error ? <p className="error-banner">{error}</p> : null}
            <button type="submit">{t('tournaments.create')}</button>
        </form>
    );
}