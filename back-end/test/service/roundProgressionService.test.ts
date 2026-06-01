import { createNextRoundMatchesIfReady } from '../../service/roundProgressionService';
import { ValidationError } from '../../util/errors';

jest.mock('../../repository/prisma/client', () => ({
  prisma: {
    match: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    round: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn()),
  },
}));

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);

describe('Round Progression Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given: round identifier parsing; when: creating next round matches; then: identifier is parsed correctly', () => {
    it('should accept numeric round identifier', async () => {
      mockPrisma.match.findMany.mockResolvedValue([]);

      await createNextRoundMatchesIfReady('1');

      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: { roundOrderNumber: 1 },
        orderBy: { matchDate: 'asc' },
      });
    });

    it('should accept round identifier with "round-" prefix', async () => {
      mockPrisma.match.findMany.mockResolvedValue([]);

      await createNextRoundMatchesIfReady('round-2');

      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: { roundOrderNumber: 2 },
        orderBy: { matchDate: 'asc' },
      });
    });

    it('should accept "Round-" prefix with capital R', async () => {
      mockPrisma.match.findMany.mockResolvedValue([]);

      await createNextRoundMatchesIfReady('Round-1');

      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: { roundOrderNumber: 1 },
        orderBy: { matchDate: 'asc' },
      });
    });
  });

  describe('given: invalid round identifier; when: creating next round; then: error is thrown', () => {
    it('should reject zero round identifier', async () => {
      await expect(createNextRoundMatchesIfReady('0')).rejects.toThrow(ValidationError);
      await expect(createNextRoundMatchesIfReady('0')).rejects.toThrow(
        'Round identifier is invalid.',
      );
    });

    it('should reject negative round identifier', async () => {
      await expect(createNextRoundMatchesIfReady('-1')).rejects.toThrow(ValidationError);
    });

    it('should reject non-numeric identifier without prefix', async () => {
      await expect(createNextRoundMatchesIfReady('abc')).rejects.toThrow(ValidationError);
    });

    it('should reject non-numeric identifier after prefix', async () => {
      await expect(createNextRoundMatchesIfReady('round-abc')).rejects.toThrow(ValidationError);
    });
  });

  describe('given: empty round with no matches; when: creating next round; then: function returns without error', () => {
    it('should return early when no matches in round', async () => {
      mockPrisma.match.findMany.mockResolvedValue([]);

      await expect(createNextRoundMatchesIfReady('1')).resolves.not.toThrow();
      expect(mockPrisma.match.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('given: round with unfinished matches; when: creating next round; then: no progression occurs', () => {
    it('should return early when matches are not all finished', async () => {
      const incompleteMatches = [
        {
          id: 'match-1',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: 1,
          awayScore: null,
          matchDate: new Date(),
          status: 'IN_PROGRESS',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(incompleteMatches);

      await expect(createNextRoundMatchesIfReady('1')).resolves.not.toThrow();

      // Should not attempt to query next round
      expect(mockPrisma.match.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return early when match has no score despite FINISHED status', async () => {
      const incompleteMatches = [
        {
          id: 'match-2',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(incompleteMatches);

      await expect(createNextRoundMatchesIfReady('1')).resolves.not.toThrow();
    });
  });

  describe('given: completed round without next round; when: advancing; then: no matches are created', () => {
    it('should return early when no next round exists (final round)', async () => {
      const completedMatches = [
        {
          id: 'match-3',
          roundOrderNumber: 4,
          roundName: 'Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: 'ref-1',
          homeScore: 2,
          awayScore: 1,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany
        .mockResolvedValueOnce(completedMatches) // First round
        .mockResolvedValueOnce([]); // Next round (empty)

      await expect(createNextRoundMatchesIfReady('4')).resolves.not.toThrow();
    });
  });

  describe('given: completed round with matches; when: advancing; then: winners are determined and assigned', () => {
    it('should advance winners to next round', async () => {
      const completedMatches = [
        {
          id: 'match-1',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: 2,
          awayScore: 1,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'match-2',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-3',
          awayTeamId: 'team-4',
          refereeId: null,
          homeScore: 1,
          awayScore: 3,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const nextRoundMatches = [
        {
          id: 'next-match-1',
          roundOrderNumber: 2,
          roundName: 'Quarterfinal',
          homeTeamId: null,
          awayTeamId: null,
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date(),
          status: 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany
        .mockResolvedValueOnce(completedMatches)
        .mockResolvedValueOnce(nextRoundMatches);
      mockPrisma.$transaction.mockResolvedValue(undefined);

      await createNextRoundMatchesIfReady('1');

      // Winners: team-1 and team-4
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error if homeTeamId is missing in completed match', async () => {
      const incompleteMatches = [
        {
          id: 'match-4',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: null,
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: 2,
          awayScore: 1,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const nextRoundMatches = [
        {
          id: 'next-match-1',
          roundOrderNumber: 2,
          roundName: 'Quarterfinal',
          homeTeamId: null,
          awayTeamId: null,
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date(),
          status: 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany
        .mockResolvedValueOnce(incompleteMatches)
        .mockResolvedValueOnce(nextRoundMatches);

      await expect(createNextRoundMatchesIfReady('1')).rejects.toThrow(
        'Completed knockout matches must have both teams assigned.',
      );
    });
  });





  describe('given: next round with all teams pre-assigned; when: advancing; then: no updates occur', () => {
    it('should return early when all next round teams are already assigned', async () => {
      const completedMatches = [
        {
          id: 'match-8',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: 2,
          awayScore: 1,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'match-9',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-3',
          awayTeamId: 'team-4',
          refereeId: null,
          homeScore: 1,
          awayScore: 3,
          matchDate: new Date(),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const nextRoundMatches = [
        {
          id: 'next-match-1',
          roundOrderNumber: 2,
          roundName: 'Quarterfinal',
          homeTeamId: 'team-1', // Already assigned
          awayTeamId: 'team-4', // Already assigned
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date(),
          status: 'NOT_STARTED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany
        .mockResolvedValueOnce(completedMatches)
        .mockResolvedValueOnce(nextRoundMatches);

      await expect(createNextRoundMatchesIfReady('1')).resolves.not.toThrow();

      // Transaction should not be called since teams are already assigned
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });


});
