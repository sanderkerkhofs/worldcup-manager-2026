import { Goal as PrismaGoal } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Goal {
  public readonly id: string;
  public readonly matchId: string;
  public readonly playerId: string;
  public readonly teamId: string;
  public readonly minute: number;
  public readonly createdAt: Date;

  constructor({
    id,
    matchId,
    playerId,
    teamId,
    minute,
    createdAt,
  }: {
    id: string;
    matchId: string;
    playerId: string;
    teamId: string;
    minute: number;
    createdAt?: Date;
  }) {
    if (!matchId.trim() || !playerId.trim() || !teamId.trim()) {
      throw new ValidationError('Goal must belong to a match, player, and team.');
    }

    if (!Number.isInteger(minute) || minute < 0) {
      throw new ValidationError('Goal minute must be a non-negative integer.');
    }

    this.id = id;
    this.matchId = matchId;
    this.playerId = playerId;
    this.teamId = teamId;
    this.minute = minute;
    this.createdAt = createdAt ?? new Date();
  }

  static from(prismaGoal: PrismaGoal): Goal {
    return new Goal({
      id: prismaGoal.id,
      matchId: prismaGoal.matchId,
      playerId: prismaGoal.playerId,
      teamId: prismaGoal.teamId,
      minute: prismaGoal.minute,
      createdAt: prismaGoal.createdAt,
    });
  }
}
