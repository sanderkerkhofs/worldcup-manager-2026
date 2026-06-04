import {
  listPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../../service/playerService';
import { Player } from '../../model/player';
import { NotFoundError, ValidationError } from '../../util/errors';

jest.mock('../../repository/prisma/client', () => ({
  prisma: {
    player: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    team: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);

describe('Player Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given: team with players; when: listing all players; then: all players are returned', () => {

  describe('given: non-existent playerId; when: getting player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(getPlayer(99999)).rejects.toThrow(NotFoundError);
      await expect(getPlayer(99999)).rejects.toThrow('Player was not found.');
    });
  });

  describe('given: valid player creation data; when: creating player; then: player is created successfully', () => {
    it('should create player with valid input', async () => {
      const input = {
        teamName: 'Argentina',
        firstName: 'Diego',
        lastName: 'Maradona',
        shirtNumber: 10,
        position: 'Midfielder',
      };

      mockPrisma.team.findUnique.mockResolvedValue({
        id: 1,
        name: 'Argentina',
        country: 'Argentina',
        countryShortName: 'ARG',
        countryFlag: '🇦🇷',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.findUnique.mockResolvedValue(null);

      mockPrisma.player.create.mockResolvedValue({
        id: 'player-6',
        teamName: 'Argentina',
        firstName: 'Diego',
        lastName: 'Maradona',
        shirtNumber: 10,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPlayer(input);

      expect(result).toBeInstanceOf(Player);
      expect(result.firstName).toBe('Diego');
      expect(result.lastName).toBe('Maradona');
      expect(result.shirtNumber).toBe(10);
    });
  });

  describe('given: non-existent team; when: creating player; then: error is thrown', () => {
    it('should throw NotFoundError when team does not exist', async () => {
      const input = {
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      };

      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(createPlayer(input)).rejects.toThrow(NotFoundError);
      await expect(createPlayer(input)).rejects.toThrow('Team was not found.');
    });
  });

  describe('given: duplicate shirt number in team; when: creating player; then: error is thrown', () => {
    it('should reject player creation with existing shirt number in team', async () => {
      const input = {
        teamName: 'Argentina',
        firstName: 'New',
        lastName: 'Player',
        shirtNumber: 7,
        position: 'Forward',
      };

      mockPrisma.team.findUnique.mockResolvedValue({
        id: 1,
        name: 'Team A',
        country: 'Country A',
        countryShortName: 'TA',
        countryFlag: '🚩',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 1,
        teamName: 'Argentina',
        firstName: 'Existing',
        lastName: 'Player',
        shirtNumber: 7,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(createPlayer(input)).rejects.toThrow(ValidationError);
      await expect(createPlayer(input)).rejects.toThrow('Shirt number is already used in this team.');
    });
  });

  describe('given: valid player update data; when: updating player; then: player is updated successfully', () => {
    it('should update player firstName', async () => {
      const input = { firstName: 'NewFirstName' };

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-7',
        teamName: 'Argentina',
        firstName: 'OldFirstName',
        lastName: 'Doe',
        shirtNumber: 5,
        position: 'Defender',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-7',
        teamName: 'Argentina',
        firstName: 'NewFirstName',
        lastName: 'Doe',
        shirtNumber: 5,
        position: 'Defender',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer(7, input);

      expect(result.firstName).toBe('NewFirstName');
    });

    it('should update player shirtNumber', async () => {
      const input = { shirtNumber: 11 };

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-8',
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 5,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-8',
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 11,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer(8, input);

      expect(result.shirtNumber).toBe(11);
    });

    it('should preserve existing values for unspecified fields', async () => {
      const input = { firstName: 'Updated' };

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-9',
        teamName: 'Argentina',
        firstName: 'Old',
        lastName: 'Name',
        shirtNumber: 7,
        position: 'Forward',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-9',
        teamName: 'Argentina',
        firstName: 'Updated',
        lastName: 'Name',
        shirtNumber: 7,
        position: 'Forward',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer(9, input);

      expect(result.lastName).toBe('Name');
      expect(result.shirtNumber).toBe(7);
      expect(result.position).toBe('Forward');
    });
  });

  describe('given: non-existent playerId; when: updating player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      const input = { firstName: 'New' };

      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(updatePlayer(99999, input)).rejects.toThrow(NotFoundError);
      await expect(updatePlayer(99999, input)).rejects.toThrow('Player was not found.');
    });
  });

  });

  describe('given: non-existent playerId; when: deleting player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(deletePlayer(99999)).rejects.toThrow(NotFoundError);
      await expect(deletePlayer(99999)).rejects.toThrow('Player was not found.');
    });
  });
});
