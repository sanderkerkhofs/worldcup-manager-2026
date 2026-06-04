import {
  getCompetitionOverview,
  listRounds,
  simulateRound,
  resetTournamentMatches,
} from '../../service/tournamentService';

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
    goal: {
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
    round: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    player: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn()),
  },
}));
jest.mock('../../service/roundProgressionService');

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);

describe('Tournament Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default return values for all mocks
    mockPrisma.match.findMany.mockResolvedValue([]);
    mockPrisma.match.findFirst.mockResolvedValue(null);
    mockPrisma.match.findUnique.mockResolvedValue(null);
    mockPrisma.team.findMany.mockResolvedValue([]);
    mockPrisma.team.findFirst.mockResolvedValue(null);
    mockPrisma.team.findUnique.mockResolvedValue(null);
    mockPrisma.goal.findMany.mockResolvedValue([]);
    mockPrisma.goal.findFirst.mockResolvedValue(null);
    mockPrisma.goal.findUnique.mockResolvedValue(null);
    mockPrisma.round.findMany.mockResolvedValue([]);
    mockPrisma.round.findFirst.mockResolvedValue(null);
    mockPrisma.round.findUnique.mockResolvedValue(null);
    mockPrisma.player.findMany.mockResolvedValue([]);
    mockPrisma.player.findFirst.mockResolvedValue(null);
    mockPrisma.player.findUnique.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue(null);
  });

  describe('given: tournament with matches and goals; when: getting competition overview; then: overview with standings is returned', () => {

  });

  describe('given: tournament matches with results; when: getting standings; then: standings are calculated correctly', () => {
  });

  describe('given: matches with goals; when: getting top scorers; then: top scorers are ranked by goals', () => {


    it('should return empty array when no goals exist', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([]);
      mockPrisma.match.findMany.mockResolvedValue([]);
      mockPrisma.team.findMany.mockResolvedValue([]);
      mockPrisma.round.findMany.mockResolvedValue([]);

      const result = await getCompetitionOverview();

      expect(result.topScorers).toHaveLength(0);
    });
  });

  describe('given: incomplete round; when: simulating round; then: error is thrown or no progression', () => {

  });

  describe('given: tournament with data; when: resetting tournament; then: data is reset appropriately', () => {

  });

  describe('given: multiple teams without matches; when: getting standings; then: all teams have zero stats', () => {
    it('should return all teams with zero statistics', async () => {
      const mockMatches: any[] = [];
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Argentina',
          country: 'Argentina',
          countryShortName: 'ARG',
          countryFlag: '🇦🇷',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'team-2',
          name: 'France',
          country: 'France',
          countryShortName: 'FRA',
          countryFlag: '🇫🇷',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'team-3',
          name: 'Germany',
          country: 'Germany',
          countryShortName: 'GER',
          countryFlag: '🇩🇪',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.match.findMany.mockResolvedValue(mockMatches);
      mockPrisma.team.findMany.mockResolvedValue(mockTeams);

      const result = await getCompetitionOverview();

      expect(result.standings).toHaveLength(3);
      result.standings.forEach((standing: any) => {
        expect(standing.played).toBe(0);
        expect(standing.won).toBe(0);
        expect(standing.drawn).toBe(0);
        expect(standing.lost).toBe(0);
        expect(standing.goalsFor).toBe(0);
        expect(standing.goalsAgainst).toBe(0);
        expect(standing.goalDifference).toBe(0);
        expect(standing.points).toBe(0);
      });
    });
  });

  describe('given: standings with equal points; when: getting standings; then: standings are sorted by goal difference', () => {

  });
});
