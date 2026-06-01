import { Goal } from '../../model/goal';
import { ValidationError } from '../../util/errors';

describe('Goal domain model', () => {
  describe('given: valid goal data; when: creating a goal; then: goal is created successfully', () => {
    it('should create a goal with all valid fields', () => {
      const goal = new Goal({
        id: 'goal-1',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
      });

      expect(goal.id).toBe('goal-1');
      expect(goal.matchId).toBe('match-1');
      expect(goal.playerId).toBe('player-1');
      expect(goal.teamId).toBe('team-1');
      expect(goal.createdAt).toBeInstanceOf(Date);
    });

    it('should create multiple goals for the same match', () => {
      const goals = [
        { id: 'goal-1', matchId: 'match-1', playerId: 'player-1', teamId: 'team-1' },
        { id: 'goal-2', matchId: 'match-1', playerId: 'player-2', teamId: 'team-1' },
        { id: 'goal-3', matchId: 'match-1', playerId: 'player-3', teamId: 'team-2' },
      ];

      goals.forEach((goalData) => {
        const goal = new Goal(goalData);
        expect(goal.matchId).toBe('match-1');
      });
    });

    it('should auto-generate timestamp when not provided', () => {
      const before = new Date();
      const goal = new Goal({
        id: 'goal-2',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
      });
      const after = new Date();

      expect(goal.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(goal.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamp', () => {
      const createdAt = new Date('2026-06-15T18:30:00Z');
      const goal = new Goal({
        id: 'goal-3',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
        createdAt,
      });

      expect(goal.createdAt).toEqual(createdAt);
    });
  });

  describe('given: invalid matchId; when: creating goal; then: error is thrown', () => {
    it('should reject empty matchId', () => {
      expect(() => new Goal({
        id: 'goal-4',
        matchId: '',
        playerId: 'player-1',
        teamId: 'team-1',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 'goal-4',
        matchId: '',
        playerId: 'player-1',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject whitespace-only matchId', () => {
      expect(() => new Goal({
        id: 'goal-5',
        matchId: '   ',
        playerId: 'player-1',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null matchId', () => {
      expect(() => new Goal({
        id: 'goal-6',
        matchId: null as any,
        playerId: 'player-1',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: invalid playerId; when: creating goal; then: error is thrown', () => {
    it('should reject empty playerId', () => {
      expect(() => new Goal({
        id: 'goal-7',
        matchId: 'match-1',
        playerId: '',
        teamId: 'team-1',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 'goal-7',
        matchId: 'match-1',
        playerId: '',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject whitespace-only playerId', () => {
      expect(() => new Goal({
        id: 'goal-8',
        matchId: 'match-1',
        playerId: '   ',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null playerId', () => {
      expect(() => new Goal({
        id: 'goal-9',
        matchId: 'match-1',
        playerId: null as any,
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: invalid teamId; when: creating goal; then: error is thrown', () => {
    it('should reject empty teamId', () => {
      expect(() => new Goal({
        id: 'goal-10',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: '',
      })).toThrow(ValidationError);
      expect(() => new Goal({
        id: 'goal-10',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject whitespace-only teamId', () => {
      expect(() => new Goal({
        id: 'goal-11',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: '   ',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject null teamId', () => {
      expect(() => new Goal({
        id: 'goal-12',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: null as any,
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: multiple invalid fields; when: creating goal; then: error is thrown for first validation', () => {
    it('should reject goal with all empty fields', () => {
      expect(() => new Goal({
        id: 'goal-13',
        matchId: '',
        playerId: '',
        teamId: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject goal with empty matchId and playerId', () => {
      expect(() => new Goal({
        id: 'goal-14',
        matchId: '',
        playerId: '',
        teamId: 'team-1',
      })).toThrow('Goal must belong to a match, player, and team.');
    });

    it('should reject goal with empty playerId and teamId', () => {
      expect(() => new Goal({
        id: 'goal-15',
        matchId: 'match-1',
        playerId: '',
        teamId: '',
      })).toThrow('Goal must belong to a match, player, and team.');
    });
  });

  describe('given: prisma goal object; when: converting to Goal; then: goal is created from prisma data', () => {
    it('should create Goal from Prisma goal object', () => {
      const prismaGoal = {
        id: 'goal-16',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
        createdAt: new Date('2026-06-15T18:30:00Z'),
      };

      const goal = Goal.from(prismaGoal);

      expect(goal.id).toBe('goal-16');
      expect(goal.matchId).toBe('match-1');
      expect(goal.playerId).toBe('player-1');
      expect(goal.teamId).toBe('team-1');
      expect(goal.createdAt).toEqual(prismaGoal.createdAt);
    });
  });

  describe('given: goal properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const goal = new Goal({
        id: 'goal-17',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
      });

      expect(goal.id).toBe('goal-17');
      expect(goal.matchId).toBe('match-1');
      expect(goal.playerId).toBe('player-1');
      expect(goal.teamId).toBe('team-1');
    });
  });

  describe('given: goals in sequence; when: creating multiple goals; then: order is maintained', () => {
    it('should create goals with different timestamps', async () => {
      const goal1 = new Goal({
        id: 'goal-18',
        matchId: 'match-1',
        playerId: 'player-1',
        teamId: 'team-1',
        createdAt: new Date('2026-06-15T18:00:00Z'),
      });

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const goal2 = new Goal({
        id: 'goal-19',
        matchId: 'match-1',
        playerId: 'player-2',
        teamId: 'team-1',
        createdAt: new Date('2026-06-15T18:05:00Z'),
      });

      expect(goal1.createdAt.getTime()).toBeLessThan(goal2.createdAt.getTime());
    });

    it('should allow same player to score multiple goals', () => {
      const goals = [
        new Goal({
          id: 'goal-20',
          matchId: 'match-1',
          playerId: 'player-1',
          teamId: 'team-1',
        }),
        new Goal({
          id: 'goal-21',
          matchId: 'match-1',
          playerId: 'player-1',
          teamId: 'team-1',
        }),
      ];

      expect(goals[0].playerId).toBe(goals[1].playerId);
      expect(goals[0].id).not.toBe(goals[1].id);
    });
  });

  describe('given: goal with long ID strings; when: creating; then: IDs are accepted', () => {
    it('should accept long goal IDs', () => {
      const goal = new Goal({
        id: 'goal-very-long-identifier-with-many-characters-12345',
        matchId: 'match-very-long-identifier-with-many-characters-12345',
        playerId: 'player-very-long-identifier-with-many-characters-12345',
        teamId: 'team-very-long-identifier-with-many-characters-12345',
      });

      expect(goal.id).toBe('goal-very-long-identifier-with-many-characters-12345');
    });

    it('should accept UUID-style IDs', () => {
      const goal = new Goal({
        id: '550e8400-e29b-41d4-a716-446655440000',
        matchId: '550e8400-e29b-41d4-a716-446655440001',
        playerId: '550e8400-e29b-41d4-a716-446655440002',
        teamId: '550e8400-e29b-41d4-a716-446655440003',
      });

      expect(goal.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});
