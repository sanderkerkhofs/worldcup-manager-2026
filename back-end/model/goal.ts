import { Goal as PrismaGoal } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Goal {
  public readonly id: string;
  public readonly matchId: string;
  public readonly playerId: string;
  public readonly teamId: string;
  public readonly createdAt: Date;

  constructor({
    id,
    matchId,
    playerId,
    teamId,
    createdAt,
  }: {
    id: string;
    matchId: string;
    playerId: string;
    teamId: string;
    createdAt?: Date;
  }) {
    if (!matchId.trim() || !playerId.trim() || !teamId.trim()) {
      throw new ValidationError('Goal must belong to a match, player, and team.');
    }

    this.id = id;
    this.matchId = matchId;
    this.playerId = playerId;
    this.teamId = teamId;
    this.createdAt = createdAt ?? new Date();
  }

  static from(prismaGoal: PrismaGoal): Goal {
    return new Goal({
      id: prismaGoal.id,
      matchId: prismaGoal.matchId,
      playerId: prismaGoal.playerId,
      teamId: prismaGoal.teamId,
      createdAt: prismaGoal.createdAt,
    });
  }
}
