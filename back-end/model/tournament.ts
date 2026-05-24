import { Tournament as PrismaTournament } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Tournament {
    public readonly id: string;
    public readonly name: string;
    public readonly year: number;
    public readonly format: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor({ id, name, year, format, createdAt, updatedAt }: {
        id: string;
        name: string;
        year: number;
        format: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        if (!name.trim()) {
            throw new ValidationError('Tournament name is required.');
        }

        if (!Number.isInteger(year) || year < 1900 || year > 3000) {
            throw new ValidationError('Tournament year must be a realistic whole number.');
        }

        if (!format.trim()) {
            throw new ValidationError('Tournament format is required.');
        }

        this.id = id;
        this.name = name.trim();
        this.year = year;
        this.format = format.trim();
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = updatedAt ?? new Date();
    }

    static from(prismaTournament: PrismaTournament): Tournament {
        return new Tournament({
            id: prismaTournament.id,
            name: prismaTournament.name,
            year: prismaTournament.year,
            format: prismaTournament.format,
            createdAt: prismaTournament.createdAt,
            updatedAt: prismaTournament.updatedAt,
        });
    }
}