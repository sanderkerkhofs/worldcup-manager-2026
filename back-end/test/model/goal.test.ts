import { Goal } from '../../model/goal';
import { ValidationError } from '../../util/errors';

describe('Goal domain model', () => {
  describe('given: valid goal data; when: creating a goal; then: goal is created successfully', () => {
    it('should create a goal with all valid fields', () => {
      const goal = new Goal({
        id: 1,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
      });

      expect(goal.id).toBe(1);
      expect(goal.matchId).toBe(1);
      expect(goal.playerId).toBe(1);
      expect(goal.teamName).toBe('Argentina');
      expect(goal.createdAt).toBeInstanceOf(Date);
    });

    it('should create multiple goals for the same match', () => {
      const goals = [
        { id: 1, matchId: 1, playerId: 1, teamName: 'Argentina' },
        { id: 2, matchId: 1, playerId: 2, teamName: 'Argentina' },
        { id: 3, matchId: 1, playerId: 3, teamName: 'Brazil' },
      ];

      goals.forEach((goalData) => {
        const goal = new Goal(goalData);
        expect(goal.matchId).toBe(1);
      });
    });

    it('should auto-generate timestamp when not provided', () => {
      const before = new Date();
      const goal = new Goal({
        id: 4,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
      });
      const after = new Date();

      expect(goal.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(goal.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamp', () => {
      const createdAt = new Date('2026-06-15T18:30:00Z');
      const goal = new Goal({
        id: 5,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
        createdAt,
      });

      expect(goal.createdAt).toEqual(createdAt);
    });
  });

  describe('given: invalid matchId; when: creating goal; then: error is thrown', () => {
    it('should reject zero matchId', () => {
      expect(() => new Goal({
        id: 6,
        matchId: 0,
        playerId: 1,
        teamName: 'Argentina',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 6,
        matchId: 0,
        playerId: 1,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject negative matchId', () => {
      expect(() => new Goal({
        id: 7,
        matchId: -1,
        playerId: 1,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null matchId', () => {
      expect(() => new Goal({
        id: 8,
        matchId: null as any,
        playerId: 1,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: invalid playerId; when: creating goal; then: error is thrown', () => {
    it('should reject zero playerId', () => {
      expect(() => new Goal({
        id: 9,
        matchId: 1,
        playerId: 0,
        teamName: 'Argentina',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 9,
        matchId: 1,
        playerId: 0,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject negative playerId', () => {
      expect(() => new Goal({
        id: 10,
        matchId: 1,
        playerId: -1,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null playerId', () => {
      expect(() => new Goal({
        id: 11,
        matchId: 1,
        playerId: null as any,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: invalid teamName; when: creating goal; then: error is thrown', () => {
    it('should reject empty teamName', () => {
      expect(() => new Goal({
        id: 12,
        matchId: 1,
        playerId: 1,
        teamName: '',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 12,
        matchId: 1,
        playerId: 1,
        teamName: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject whitespace-only teamName', () => {
      expect(() => new Goal({
        id: 13,
        matchId: 1,
        playerId: 1,
        teamName: '   ',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null teamName', () => {
      expect(() => new Goal({
        id: 14,
        matchId: 1,
        playerId: 1,
        teamName: null as any,
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: multiple invalid fields; when: creating goal; then: error is thrown for first validation', () => {
    it('should reject goal with all zero/empty fields', () => {
      expect(() => new Goal({
        id: 15,
        matchId: 0,
        playerId: 0,
        teamName: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject goal with zero matchId and playerId', () => {
      expect(() => new Goal({
        id: 16,
        matchId: 0,
        playerId: 0,
        teamName: 'Argentina',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject goal with zero playerId and empty teamName', () => {
      expect(() => new Goal({
        id: 17,
        matchId: 1,
        playerId: 0,
        teamName: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: prisma goal object; when: converting to Goal; then: goal is created from prisma data', () => {
    it('should create Goal from Prisma goal object', () => {
      const prismaGoal = {
        id: 18,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
        createdAt: new Date('2026-06-15T18:30:00Z'),
      };

      const goal = Goal.from(prismaGoal);

      expect(goal.id).toBe(18);
      expect(goal.matchId).toBe(1);
      expect(goal.playerId).toBe(1);
      expect(goal.teamName).toBe('Argentina');
      expect(goal.createdAt).toEqual(prismaGoal.createdAt);
    });
  });

  describe('given: goal properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const goal = new Goal({
        id: 17,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
      });

      expect(goal.id).toBe(17);
      expect(goal.matchId).toBe(1);
      expect(goal.playerId).toBe(1);
      expect(goal.teamName).toBe('Argentina');
    });
  });

  describe('given: goals in sequence; when: creating multiple goals; then: order is maintained', () => {
    it('should create goals with different timestamps', async () => {
      const goal1 = new Goal({
        id: 18,
        matchId: 1,
        playerId: 1,
        teamName: 'Argentina',
        createdAt: new Date('2026-06-15T18:00:00Z'),
      });

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const goal2 = new Goal({
        id: 19,
        matchId: 1,
        playerId: 2,
        teamName: 'Argentina',
        createdAt: new Date('2026-06-15T18:05:00Z'),
      });

      expect(goal1.createdAt.getTime()).toBeLessThan(goal2.createdAt.getTime());
    });

    it('should allow same player to score multiple goals', () => {
      const goals = [
        new Goal({
          id: 20,
          matchId: 1,
          playerId: 1,
          teamName: 'Argentina',
        }),
        new Goal({
          id: 21,
          matchId: 1,
          playerId: 1,
          teamName: 'Argentina',
        }),
      ];

      expect(goals[0].playerId).toBe(goals[1].playerId);
      expect(goals[0].id).not.toBe(goals[1].id);
    });
  });

  describe('given: goal with various numeric IDs; when: creating; then: IDs are accepted', () => {
    it('should accept numeric goal IDs', () => {
      const goal = new Goal({
        id: 100,
        matchId: 50,
        playerId: 75,
        teamName: 'Argentina',
      });

      expect(goal.id).toBe(100);
      expect(goal.matchId).toBe(50);
      expect(goal.playerId).toBe(75);
    });

    it('should accept large numeric IDs', () => {
      const goal = new Goal({
        id: 999999,
        matchId: 888888,
        playerId: 777777,
        teamName: 'Brazil',
      });

      expect(goal.id).toBe(999999);
      expect(goal.matchId).toBe(888888);
      expect(goal.playerId).toBe(777777);
    });
  });
});
