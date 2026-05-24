import { Match as PrismaMatch } from '@prisma/client';
import { MatchStatus } from '../types';
import { ValidationError } from '../util/errors';

function isMatchStatus(status: string): status is MatchStatus {
    return status === 'SCHEDULED' || status === 'COMPLETED';
}

export class Match {
    public readonly id: string;
    public readonly tournamentId: string;
    public readonly roundId: string;
    public readonly homeTeamId: string;
    public readonly awayTeamId: string;
    public readonly refereeId: string | null;
    public readonly homeScore: number | null;
    public readonly awayScore: number | null;
    public readonly matchDate: Date;
    public readonly status: MatchStatus;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor({
        id,
        tournamentId,
        roundId,
        homeTeamId,
        awayTeamId,
        refereeId,
        homeScore,
        awayScore,
        matchDate,
        status,
        createdAt,
        updatedAt,
    }: {
        id: string;
        tournamentId: string;
        roundId: string;
        homeTeamId: string;
        awayTeamId: string;
        refereeId: string | null;
        homeScore: number | null;
        awayScore: number | null;
        matchDate: Date;
        status: MatchStatus;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        if (!tournamentId.trim() || !roundId.trim()) {
            throw new ValidationError('Match must belong to a tournament and a round.');
        }

        if (!homeTeamId.trim() || !awayTeamId.trim()) {
            throw new ValidationError('Match must have both a home team and an away team.');
        }

        if (homeTeamId === awayTeamId) {
            throw new ValidationError('Home team and away team must be different.');
        }

        if (!(matchDate instanceof Date) || Number.isNaN(matchDate.getTime())) {
            throw new ValidationError('Match date must be a valid date.');
        }

        if (!isMatchStatus(status)) {
            throw new ValidationError('Match status is invalid.');
        }

        if (homeScore !== null && (!Number.isInteger(homeScore) || homeScore < 0)) {
            throw new ValidationError('Home score must be a non-negative integer.');
        }

        if (awayScore !== null && (!Number.isInteger(awayScore) || awayScore < 0)) {
            throw new ValidationError('Away score must be a non-negative integer.');
        }

        this.id = id;
        this.tournamentId = tournamentId;
        this.roundId = roundId;
        this.homeTeamId = homeTeamId;
        this.awayTeamId = awayTeamId;
        this.refereeId = refereeId;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.matchDate = matchDate;
        this.status = status;
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = updatedAt ?? new Date();
    }

    static from(prismaMatch: PrismaMatch & { refereeId?: string | null; }): Match {
        const status = prismaMatch.status as unknown as string;

        if (!isMatchStatus(status)) {
            throw new ValidationError('Match status is invalid.');
        }

        return new Match({
            id: prismaMatch.id,
            tournamentId: prismaMatch.tournamentId,
            roundId: prismaMatch.roundId,
            homeTeamId: prismaMatch.homeTeamId,
            awayTeamId: prismaMatch.awayTeamId,
            refereeId: prismaMatch.refereeId ?? null,
            homeScore: prismaMatch.homeScore,
            awayScore: prismaMatch.awayScore,
            matchDate: prismaMatch.matchDate,
            status,
            createdAt: prismaMatch.createdAt,
            updatedAt: prismaMatch.updatedAt,
        });
    }
}