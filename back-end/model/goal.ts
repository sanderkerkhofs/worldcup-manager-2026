import { Goal as PrismaGoal } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Goal {
  public readonly id: number;
  public readonly matchId: number;
  public readonly playerId: number;
  public readonly teamName: string;
  public readonly createdAt: Date;

  constructor({
    id,
    matchId,
    playerId,
    teamName,
    createdAt,
  }: {
    id: number;
    matchId: number;
    playerId: number;
    teamName: string;
    createdAt?: Date;
  }) {
    if (!Number.isInteger(matchId) || matchId <= 0 || !Number.isInteger(playerId) || playerId <= 0 || !teamName || !teamName.trim()) {
      throw new ValidationError('Goal must belong to a match, player, and team.');
    }

    this.id = id;
    this.matchId = matchId;
    this.playerId = playerId;
    this.teamName = teamName;
    this.createdAt = createdAt ?? new Date();
  }

  static from(prismaGoal: PrismaGoal): Goal {
    return new Goal({
      id: prismaGoal.id,
      matchId: prismaGoal.matchId,
      playerId: prismaGoal.playerId,
      teamName: prismaGoal.teamName,
      createdAt: prismaGoal.createdAt,
    });
  }
}
