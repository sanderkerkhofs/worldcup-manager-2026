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
    it('should return match with goals information', async () => {
      const matchDate = new Date('2026-06-15T18:00:00Z');
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-7',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: 'ref-1',
        homeScore: 2,
        awayScore: 1,
        matchDate,
        status: 'FINISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [
          {
            id: 'goal-1',
            matchId: 'match-7',
            playerId: 'player-1',
            teamId: 'team-1',
            createdAt: new Date(),
            player: {
              id: 'player-1',
              firstName: 'John',
              lastName: 'Doe',
            },
            team: {
              id: 'team-1',
              name: 'Team A',
              countryFlag: '🚩',
            },
          },
          {
            id: 'goal-2',
            matchId: 'match-7',
            playerId: 'player-2',
            teamId: 'team-1',
            createdAt: new Date(),
            player: {
              id: 'player-2',
              firstName: 'Jane',
              lastName: 'Smith',
            },
            team: {
              id: 'team-1',
              name: 'Team A',
              countryFlag: '🚩',
            },
          },
          {
            id: 'goal-3',
            matchId: 'match-7',
            playerId: 'player-3',
            teamId: 'team-2',
            createdAt: new Date(),
            player: {
              id: 'player-3',
              firstName: 'Bob',
              lastName: 'Johnson',
            },
            team: {
              id: 'team-2',
              name: 'Team B',
              countryFlag: '🏳️',
            },
          },
        ],
      });

      const result = await getMatch('match-7');

      expect(result.id).toBe('match-7');
      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.goals).toHaveLength(3);
      expect(result.goals[0].playerName).toBe('John Doe');
      expect(result.goals[0].teamName).toBe('Team A');
      expect(result.goals[2].teamName).toBe('Team B');
    });

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

      const result = await getMatch('match-8');

      expect(result.id).toBe('match-8');
      expect(result.goals).toHaveLength(0);
    });

    it('should format goal information with player and team names', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-9',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: null,
        homeScore: 1,
        awayScore: 0,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [
          {
            id: 'goal-4',
            matchId: 'match-9',
            playerId: 'player-5',
            teamId: 'team-1',
            createdAt: new Date('2026-06-15T19:00:00Z'),
            player: {
              id: 'player-5',
              firstName: 'Lionel',
              lastName: 'Messi',
            },
            team: {
              id: 'team-1',
              name: 'Argentina',
              countryFlag: '🇦🇷',
            },
          },
        ],
      });

      const result = await getMatch('match-9');

      expect(result.goals[0]).toEqual(
        expect.objectContaining({
          id: 'goal-4',
          playerId: 'player-5',
          playerName: 'Lionel Messi',
          teamId: 'team-1',
          teamName: 'Argentina',
          teamCountryFlag: '🇦🇷',
        }),
      );
    });

    it('should order goals by creation time', async () => {
      const time1 = new Date('2026-06-15T19:00:00Z');
      const time2 = new Date('2026-06-15T19:05:00Z');
      const time3 = new Date('2026-06-15T19:10:00Z');

      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-10',
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        refereeId: null,
        homeScore: 3,
        awayScore: 0,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [
          {
            id: 'goal-5',
            matchId: 'match-10',
            playerId: 'player-6',
            teamId: 'team-1',
            createdAt: time1,
            player: { id: 'player-6', firstName: 'First', lastName: 'Goal' },
            team: { id: 'team-1', name: 'Team A', countryFlag: '🚩' },
          },
          {
            id: 'goal-6',
            matchId: 'match-10',
            playerId: 'player-7',
            teamId: 'team-1',
            createdAt: time2,
            player: { id: 'player-7', firstName: 'Second', lastName: 'Goal' },
            team: { id: 'team-1', name: 'Team A', countryFlag: '🚩' },
          },
          {
            id: 'goal-7',
            matchId: 'match-10',
            playerId: 'player-8',
            teamId: 'team-1',
            createdAt: time3,
            player: { id: 'player-8', firstName: 'Third', lastName: 'Goal' },
            team: { id: 'team-1', name: 'Team A', countryFlag: '🚩' },
          },
        ],
      } as any);

      const result = await getMatch('match-10');

      expect(result.goals[0].playerName).toBe('First Goal');
      expect(result.goals[1].playerName).toBe('Second Goal');
      expect(result.goals[2].playerName).toBe('Third Goal');
    });
  });

  describe('given: non-existent matchId; when: getting match; then: error is thrown', () => {
    it('should throw NotFoundError when match does not exist', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(getMatch('nonexistent-match')).rejects.toThrow(NotFoundError);
      await expect(getMatch('nonexistent-match')).rejects.toThrow('Match was not found.');
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

      const result = await getMatch('match-11');

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

      const result = await getMatch('match-12');

      expect(result.homeScore).toBe(0);
      expect(result.awayScore).toBe(0);
    });
  });

  describe('given: match with pending teams; when: getting match; then: match with null teams is returned', () => {
    it('should return match with null homeTeamId and awayTeamId', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({
        id: 'match-13',
        roundOrderNumber: 2,
        roundName: 'Quarterfinal',
        homeTeamId: null,
        awayTeamId: null,
        refereeId: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-20T18:00:00Z'),
        status: 'PLANNED',
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
      } as any);

      const result = await getMatch('match-13');

      expect(result.homeTeamId).toBeNull();
      expect(result.awayTeamId).toBeNull();
    });
  });
});
