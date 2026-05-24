import { Team as PrismaTeam } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Team {
    public readonly id: string;
    public readonly name: string;
    public readonly country: string;
    public readonly coach: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor({ id, name, country, coach, createdAt, updatedAt }: {
        id: string;
        name: string;
        country: string;
        coach: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        if (!name.trim()) {
            throw new ValidationError('Team name is required.');
        }

        if (!country.trim()) {
            throw new ValidationError('Team country is required.');
        }

        if (!coach.trim()) {
            throw new ValidationError('Team coach is required.');
        }

        this.id = id;
        this.name = name.trim();
        this.country = country.trim();
        this.coach = coach.trim();
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = updatedAt ?? new Date();
    }

    static from(prismaTeam: PrismaTeam): Team {
        return new Team({
            id: prismaTeam.id,
            name: prismaTeam.name,
            country: prismaTeam.country,
            coach: prismaTeam.coach,
            createdAt: prismaTeam.createdAt,
            updatedAt: prismaTeam.updatedAt,
        });
    }
}