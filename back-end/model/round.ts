import { Round as PrismaRound } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Round {
    public readonly id: string;
    public readonly tournamentId: string;
    public readonly name: string;
    public readonly orderNumber: number;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor({ id, tournamentId, name, orderNumber, createdAt, updatedAt }: {
        id: string;
        tournamentId: string;
        name: string;
        orderNumber: number;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        if (!tournamentId.trim()) {
            throw new ValidationError('Round must belong to a tournament.');
        }

        if (!name.trim()) {
            throw new ValidationError('Round name is required.');
        }

        if (!Number.isInteger(orderNumber) || orderNumber < 1) {
            throw new ValidationError('Round order number must be a positive integer.');
        }

        this.id = id;
        this.tournamentId = tournamentId;
        this.name = name.trim();
        this.orderNumber = orderNumber;
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = updatedAt ?? new Date();
    }

    static from(prismaRound: PrismaRound): Round {
        return new Round({
            id: prismaRound.id,
            tournamentId: prismaRound.tournamentId,
            name: prismaRound.name,
            orderNumber: prismaRound.orderNumber,
            createdAt: prismaRound.createdAt,
            updatedAt: prismaRound.updatedAt,
        });
    }
}