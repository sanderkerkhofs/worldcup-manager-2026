import {
  listMatches,
  getMatch,
} from '../../service/matchService';
import { Match } from '../../model/match';
import { NotFoundError } from '../../util/errors';

jest.mock('../../repository/prisma/client', () => ({
  prisma: {
    match: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);

describe('Match Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given: matches in database; when: listing matches; then: all matches are returned ordered by date', () => {
    it('should return all matches ordered by matchDate ascending', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-15T18:00:00Z'),
          status: 'PLANNED',
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
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-16T18:00:00Z'),
          status: 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(mockMatches);

      const result = await listMatches();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Match);
      expect(result[0].id).toBe('match-1');
      expect(result[1].id).toBe('match-2');
      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({ orderBy: { matchDate: 'asc' } });
    });

    it('should return empty array when no matches exist', async () => {
      mockPrisma.match.findMany.mockResolvedValue([]);

      const result = await listMatches();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return matches with various statuses', async () => {
      const mockMatches = [
        {
          id: 'match-3',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-15T18:00:00Z'),
          status: 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'match-4',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-3',
          awayTeamId: 'team-4',
          refereeId: 'ref-1',
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-16T18:00:00Z'),
          status: 'IN_PROGRESS',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'match-5',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-5',
          awayTeamId: 'team-6',
          refereeId: 'ref-2',
          homeScore: 2,
          awayScore: 1,
          matchDate: new Date('2026-06-17T18:00:00Z'),
          status: 'FINISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(mockMatches);

      const result = await listMatches();

      expect(result[0].status).toBe('PLANNED');
      expect(result[1].status).toBe('IN_PROGRESS');
      expect(result[2].status).toBe('FINISHED');
    });

    it('should return matches as Match domain objects', async () => {
      const mockMatches = [
        {
          id: 'match-6',
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-15T18:00:00Z'),
          status: 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(mockMatches);

      const result = await listMatches();

      expect(result[0]).toBeInstanceOf(Match);
      expect(result[0].roundName).toBe('8th Final');
      expect(result[0].status).toBe('PLANNED');
    });
  });

  describe('given: valid matchId; when: getting match; then: match with goals is returned', () => {
    it('should return match without goals', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-8',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
      });

      const result = await getMatch(8);

      expect(result.id).toBe('match-8');
      expect(result.goals).toHaveLength(0);
    });
  });

  describe('given: non-existent matchId; when: getting match; then: error is thrown', () => {
    it('should throw NotFoundError when match does not exist', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(getMatch(99999)).rejects.toThrow(NotFoundError);
      await expect(getMatch(99999)).rejects.toThrow('Match was not found.');
    });
  });

  describe('given: finished match; when: getting match; then: match with complete score is returned', () => {
    it('should return finished match with home and away scores', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-11',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: 'ref-1',
        homeScore: 3,
        awayScore: 2,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
      } as any);

      const result = await getMatch(11);

      expect(result.homeScore).toBe(3);
      expect(result.awayScore).toBe(2);
      expect(result.status).toBe('FINISHED');
    });

    it('should return match with zero scores', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-12',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: 'ref-1',
        homeScore: 0,
        awayScore: 0,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
      } as any);

      const result = await getMatch(12);

      expect(result.homeScore).toBe(0);
      expect(result.awayScore).toBe(0);
    });
  });
});
