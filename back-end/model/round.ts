import { Round as PrismaRound } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Round {
  public readonly id: string;
  public readonly name: string;
  public readonly orderNumber: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    id,
    name,
    orderNumber,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    orderNumber: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!name.trim()) {
      throw new ValidationError('Round name is required.');
    }

    if (!Number.isInteger(orderNumber) || orderNumber <= 0) {
      throw new ValidationError('Round order number must be a positive integer.');
    }

    this.id = id;
    this.name = name;
    this.orderNumber = orderNumber;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaRound: PrismaRound): Round {
    return new Round({
      id: prismaRound.id,
      name: prismaRound.name,
      orderNumber: prismaRound.orderNumber,
      createdAt: prismaRound.createdAt,
      updatedAt: prismaRound.updatedAt,
    });
  }
}
