import { Team as PrismaTeam } from '@prisma/client';
import { ValidationError } from '../util/errors';

export class Team {
  public readonly id: string;
  public readonly name: string;
  public readonly country: string;
  public readonly countryShortName: string;
  public readonly countryFlag: string;
  public readonly coach: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    id,
    name,
    country,
    countryShortName,
    countryFlag,
    coach,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    country: string;
    countryShortName: string;
    countryFlag: string;
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

    if (!countryShortName.trim()) {
      throw new ValidationError('Team country short name is required.');
    }

    if (!countryFlag.trim()) {
      throw new ValidationError('Team country flag is required.');
    }

    if (!coach.trim()) {
      throw new ValidationError('Team coach is required.');
    }

    this.id = id;
    this.name = name;
    this.country = country;
    this.countryShortName = countryShortName;
    this.countryFlag = countryFlag;
    this.coach = coach;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaTeam: PrismaTeam): Team {
    return new Team({
      id: prismaTeam.id,
      name: prismaTeam.name,
      country: prismaTeam.country,
      countryShortName: prismaTeam.countryShortName,
      countryFlag: prismaTeam.countryFlag,
      coach: prismaTeam.coach,
      createdAt: prismaTeam.createdAt,
      updatedAt: prismaTeam.updatedAt,
    });
  }
}
