import { MatchStatus } from '../types';
import { ValidationError } from '../util/errors';

type PrismaMatchLike = {
  id: number;
  roundOrderNumber: number;
  roundName: string;
  homeTeamName: string | null;
  awayTeamName: string | null;
  refereeUsername?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: Date;
  status: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function isMatchStatus(status: string): status is MatchStatus {
  return status === 'PLANNED'
    || status === 'NOT_STARTED'
    || status === 'IN_PROGRESS'
    || status === 'FINISHED';
}

export class Match {
  public readonly id: number;
  public readonly roundOrderNumber: number;
  public readonly roundName: string;
  public readonly roundId: string;
  public readonly homeTeamName: string | null;
  public readonly awayTeamName: string | null;
  public readonly refereeUsername: string | null;
  public readonly homeScore: number | null;
  public readonly awayScore: number | null;
  public readonly matchDate: Date;
  public readonly status: MatchStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    id,
    roundOrderNumber,
    roundName,
    homeTeamName,
    awayTeamName,
    refereeUsername,
    homeScore,
    awayScore,
    matchDate,
    status,
    createdAt,
    updatedAt,
  }: {
    id: number;
    roundOrderNumber: number;
    roundName: string;
    homeTeamName: string | null;
    awayTeamName: string | null;
    refereeUsername: string | null;
    homeScore: number | null;
    awayScore: number | null;
    matchDate: Date;
    status: MatchStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!Number.isInteger(roundOrderNumber) || roundOrderNumber <= 0) {
      throw new ValidationError('Match must belong to a valid round order number.');
    }

    if (!roundName.trim()) {
      throw new ValidationError('Match must belong to a named round.');
    }

    if ((homeTeamName === null) !== (awayTeamName === null)) {
      throw new ValidationError('Match teams must either both be present or both be pending.');
    }

    if (homeTeamName && awayTeamName && homeTeamName === awayTeamName) {
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
    this.roundOrderNumber = roundOrderNumber;
    this.roundName = roundName;
    this.roundId = String(roundOrderNumber);
    this.homeTeamName = homeTeamName;
    this.awayTeamName = awayTeamName;
    this.refereeUsername = refereeUsername;
    this.homeScore = homeScore;
    this.awayScore = awayScore;
    this.matchDate = matchDate;
    this.status = status;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaMatch: PrismaMatchLike): Match {
    const status = prismaMatch.status as unknown as string;

    if (!isMatchStatus(status)) {
      throw new ValidationError('Match status is invalid.');
    }

    return new Match({
      id: prismaMatch.id,
      roundOrderNumber: prismaMatch.roundOrderNumber,
      roundName: prismaMatch.roundName,
      homeTeamName: prismaMatch.homeTeamName,
      awayTeamName: prismaMatch.awayTeamName,
      refereeUsername: prismaMatch.refereeUsername ?? null,
      homeScore: prismaMatch.homeScore,
      awayScore: prismaMatch.awayScore,
      matchDate: prismaMatch.matchDate,
      status,
      createdAt: prismaMatch.createdAt,
      updatedAt: prismaMatch.updatedAt,
    });
  }
}
