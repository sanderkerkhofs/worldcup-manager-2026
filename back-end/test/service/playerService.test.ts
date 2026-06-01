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
    it('should return all players ordered by team and shirt number', async () => {
      const mockPlayers = [
        {
          id: 'player-1',
          teamId: 'team-1',
          firstName: 'John',
          lastName: 'Doe',
          shirtNumber: 1,
          position: 'Goalkeeper',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'player-2',
          teamId: 'team-1',
          firstName: 'Jane',
          lastName: 'Smith',
          shirtNumber: 10,
          position: 'Forward',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.player.findMany.mockResolvedValue(mockPlayers);

      const result = await listPlayers();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Player);
      expect(result[0].firstName).toBe('John');
      expect(result[1].firstName).toBe('Jane');
      expect(mockPrisma.player.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: [{ teamId: 'asc' }, { shirtNumber: 'asc' }],
      });
    });

    it('should return empty array when no players exist', async () => {
      mockPrisma.player.findMany.mockResolvedValue([]);

      const result = await listPlayers();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter players by team when teamId is provided', async () => {
      const mockPlayers = [
        {
          id: 'player-3',
          teamId: 'team-2',
          firstName: 'Bob',
          lastName: 'Johnson',
          shirtNumber: 7,
          position: 'Midfielder',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.player.findMany.mockResolvedValue(mockPlayers);

      await listPlayers('team-2');

      expect(mockPrisma.player.findMany).toHaveBeenCalledWith({
        where: { teamId: 'team-2' },
        orderBy: [{ teamId: 'asc' }, { shirtNumber: 'asc' }],
      });
    });

    it('should return players as Player domain objects', async () => {
      const mockPlayers = [
        {
          id: 'player-4',
          teamId: 'team-1',
          firstName: 'Alice',
          lastName: 'Brown',
          shirtNumber: 5,
          position: 'Defender',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.player.findMany.mockResolvedValue(mockPlayers);

      const result = await listPlayers();

      expect(result[0]).toBeInstanceOf(Player);
      expect(result[0].firstName).toBe('Alice');
      expect(result[0].shirtNumber).toBe(5);
    });
  });

  describe('given: valid playerId; when: getting player; then: player is returned', () => {
    it('should return player with valid playerId', async () => {
      const mockPlayer = {
        id: 'player-5',
        teamId: 'team-1',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        shirtNumber: 9,
        position: 'Forward',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.player.findUnique.mockResolvedValue(mockPlayer);

      const result = await getPlayer('player-5');

      expect(result).toBeInstanceOf(Player);
      expect(result.firstName).toBe('Carlos');
      expect(result.shirtNumber).toBe(9);
      expect(mockPrisma.player.findUnique).toHaveBeenCalledWith({ where: { id: 'player-5' } });
    });
  });

  describe('given: non-existent playerId; when: getting player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(getPlayer('nonexistent-player')).rejects.toThrow(NotFoundError);
      await expect(getPlayer('nonexistent-player')).rejects.toThrow('Player was not found.');
    });
  });

  describe('given: valid player creation data; when: creating player; then: player is created successfully', () => {
    it('should create player with valid input', async () => {
      const input = {
        teamId: 'team-1',
        firstName: 'Diego',
        lastName: 'Maradona',
        shirtNumber: 10,
        position: 'Midfielder',
      };

      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
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
        teamId: 'team-1',
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
        teamId: 'nonexistent-team',
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
        teamId: 'team-1',
        firstName: 'New',
        lastName: 'Player',
        shirtNumber: 7,
        position: 'Forward',
      };

      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        name: 'Team A',
        country: 'Country A',
        countryShortName: 'TA',
        countryFlag: '🚩',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'existing-player',
        teamId: 'team-1',
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
        teamId: 'team-1',
        firstName: 'OldFirstName',
        lastName: 'Doe',
        shirtNumber: 5,
        position: 'Defender',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-7',
        teamId: 'team-1',
        firstName: 'NewFirstName',
        lastName: 'Doe',
        shirtNumber: 5,
        position: 'Defender',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer('player-7', input);

      expect(result.firstName).toBe('NewFirstName');
    });

    it('should update player shirtNumber', async () => {
      const input = { shirtNumber: 11 };

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-8',
        teamId: 'team-1',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 5,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-8',
        teamId: 'team-1',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 11,
        position: 'Midfielder',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer('player-8', input);

      expect(result.shirtNumber).toBe(11);
    });

    it('should preserve existing values for unspecified fields', async () => {
      const input = { firstName: 'Updated' };

      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-9',
        teamId: 'team-1',
        firstName: 'Old',
        lastName: 'Name',
        shirtNumber: 7,
        position: 'Forward',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.update.mockResolvedValue({
        id: 'player-9',
        teamId: 'team-1',
        firstName: 'Updated',
        lastName: 'Name',
        shirtNumber: 7,
        position: 'Forward',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await updatePlayer('player-9', input);

      expect(result.lastName).toBe('Name');
      expect(result.shirtNumber).toBe(7);
      expect(result.position).toBe('Forward');
    });
  });

  describe('given: non-existent playerId; when: updating player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      const input = { firstName: 'New' };

      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(updatePlayer('nonexistent-player', input)).rejects.toThrow(NotFoundError);
      await expect(updatePlayer('nonexistent-player', input)).rejects.toThrow('Player was not found.');
    });
  });

  describe('given: valid playerId; when: deleting player; then: player is deleted successfully', () => {
    it('should delete player with valid playerId', async () => {
      mockPrisma.player.findUnique.mockResolvedValue({
        id: 'player-10',
        teamId: 'team-1',
        firstName: 'ToDelete',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Goalkeeper',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.player.delete.mockResolvedValue({
        id: 'player-10',
        teamId: 'team-1',
        firstName: 'ToDelete',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Goalkeeper',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deletePlayer('player-10')).resolves.not.toThrow();
      expect(mockPrisma.player.delete).toHaveBeenCalledWith({ where: { id: 'player-10' } });
    });
  });

  describe('given: non-existent playerId; when: deleting player; then: error is thrown', () => {
    it('should throw NotFoundError when player does not exist', async () => {
      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(deletePlayer('nonexistent-player')).rejects.toThrow(NotFoundError);
      await expect(deletePlayer('nonexistent-player')).rejects.toThrow('Player was not found.');
    });
  });
});
