import { Player as PrismaPlayer } from '@prisma/client';
import { PlayerStatus } from '../types';
import { ValidationError } from '../util/errors';

function isPlayerStatus(status: string): status is PlayerStatus {
  return status === 'AVAILABLE' || status === 'UNAVAILABLE';
}

export class Player {
  public readonly id: string;
  public readonly teamId: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly shirtNumber: number;
  public readonly position: string;
  public readonly status: PlayerStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    id,
    teamId,
    firstName,
    lastName,
    shirtNumber,
    position,
    status,
    createdAt,
    updatedAt,
  }: {
    id: string;
    teamId: string;
    firstName: string;
    lastName: string;
    shirtNumber: number;
    position: string;
    status: PlayerStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!teamId.trim()) {
      throw new ValidationError('Player must belong to a team.');
    }

    if (!firstName.trim() || !lastName.trim()) {
      throw new ValidationError('Player name is required.');
    }

    if (!Number.isInteger(shirtNumber) || shirtNumber <= 0) {
      throw new ValidationError('Shirt number must be a positive integer.');
    }

    if (!position.trim()) {
      throw new ValidationError('Player position is required.');
    }

    if (!isPlayerStatus(status)) {
      throw new ValidationError('Player status is invalid.');
    }

    this.id = id;
    this.teamId = teamId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.shirtNumber = shirtNumber;
    this.position = position;
    this.status = status;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaPlayer: PrismaPlayer): Player {
    const status = prismaPlayer.status as unknown as string;

    if (!isPlayerStatus(status)) {
      throw new ValidationError('Player status is invalid.');
    }

    return new Player({
      id: prismaPlayer.id,
      teamId: prismaPlayer.teamId,
      firstName: prismaPlayer.firstName,
      lastName: prismaPlayer.lastName,
      shirtNumber: prismaPlayer.shirtNumber,
      position: prismaPlayer.position,
      status,
      createdAt: prismaPlayer.createdAt,
      updatedAt: prismaPlayer.updatedAt,
    });
  }
}
