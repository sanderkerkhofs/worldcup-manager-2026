import { Match } from '../../model/match';
import { ValidationError } from '../../util/errors';

describe('Match domain model', () => {
  describe('given: valid match data; when: creating a match; then: match is created successfully', () => {
    it('should create a match with all valid fields', () => {
      const match = new Match({
        id: 101,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });

      expect(match.id).toBe(101);
      expect(match.roundOrderNumber).toBe(1);
      expect(match.roundName).toBe('8th Final');
      expect(match.homeTeamName).toBe('Argentina');
      expect(match.awayTeamName).toBe('Brazil');
      expect(match.refereeUsername).toBeNull();
      expect(match.homeScore).toBeNull();
      expect(match.awayScore).toBeNull();
      expect(match.status).toBe('PLANNED');
      expect(match.createdAt).toBeInstanceOf(Date);
      expect(match.updatedAt).toBeInstanceOf(Date);
    });

    it('should create match with all status values', () => {
      const statuses = ['PLANNED', 'NOT_STARTED', 'IN_PROGRESS', 'FINISHED'] as const;

      statuses.forEach((status) => {
        const match = new Match({
          id: 100,
          roundOrderNumber: 1,
          roundName: '8th Final',
          homeTeamName: 'Argentina',
          awayTeamName: 'Brazil',
          refereeUsername: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-15T18:00:00Z'),
          status,
        });
        expect(match.status).toBe(status);
      });
    });

    it('should create match with assigned referee', () => {
      const match = new Match({
        id: 102,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: 'referee-1',
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });

      expect(match.refereeUsername).toBe('referee-1');
    });

    it('should create finished match with scores', () => {
      const match = new Match({
        id: 103,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: 'referee-1',
        homeScore: 2,
        awayScore: 1,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
      });

      expect(match.homeScore).toBe(2);
      expect(match.awayScore).toBe(1);
      expect(match.status).toBe('FINISHED');
    });

    it('should create match with zero scores', () => {
      const match = new Match({
        id: 104,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: 0,
        awayScore: 0,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
      });

      expect(match.homeScore).toBe(0);
      expect(match.awayScore).toBe(0);
    });

    it('should create match with high scores', () => {
      const match = new Match({
        id: 105,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: 10,
        awayScore: 9,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'FINISHED',
      });

      expect(match.homeScore).toBe(10);
      expect(match.awayScore).toBe(9);
    });

    it('should auto-generate timestamps when not provided', () => {
      const before = new Date();
      const match = new Match({
        id: 106,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });
      const after = new Date();

      expect(match.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(match.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(match.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(match.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamps', () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const updatedAt = new Date('2026-02-01T00:00:00Z');
      const match = new Match({
        id: 107,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
        createdAt,
        updatedAt,
      });

      expect(match.createdAt).toEqual(createdAt);
      expect(match.updatedAt).toEqual(updatedAt);
    });

    it('should create match with pending teams (both null)', () => {
      const match = new Match({
        id: 108,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: null,
        awayTeamName: null,
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });

      expect(match.homeTeamName).toBeNull();
      expect(match.awayTeamName).toBeNull();
    });
  });

  describe('given: invalid round order number; when: creating match; then: error is thrown', () => {
    it('should reject zero round order number', () => {
      expect(() => new Match({
        id: 109,
        roundOrderNumber: 0,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow(ValidationError);
      expect(() => new Match({
        id: 109,
        roundOrderNumber: 0,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match must belong to a valid round order number.');
    });

    it('should reject negative round order number', () => {
      expect(() => new Match({
        id: 110,
        roundOrderNumber: -1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match must belong to a valid round order number.');
    });

    it('should reject floating point round order number', () => {
      expect(() => new Match({
        id: 111,
        roundOrderNumber: 1.5,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match must belong to a valid round order number.');
    });
  });

  describe('given: invalid round name; when: creating match; then: error is thrown', () => {
    it('should reject empty round name', () => {
      expect(() => new Match({
        id: 112,
        roundOrderNumber: 1,
        roundName: '',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match must belong to a named round.');
    });

    it('should reject whitespace-only round name', () => {
      expect(() => new Match({
        id: 113,
        roundOrderNumber: 1,
        roundName: '   ',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match must belong to a named round.');
    });
  });

  describe('given: mismatched team presence; when: creating match; then: error is thrown', () => {
    it('should reject match with only home team', () => {
      expect(() => new Match({
        id: 114,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: null,
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match teams must either both be present or both be pending.');
    });

    it('should reject match with only away team', () => {
      expect(() => new Match({
        id: 115,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: null,
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Match teams must either both be present or both be pending.');
    });
  });

  describe('given: same home and away team; when: creating match; then: error is thrown', () => {
    it('should reject when home and away teams are identical', () => {
      expect(() => new Match({
        id: 116,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Argentina',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      })).toThrow('Home team and away team must be different.');
    });
  });

  describe('given: invalid match date; when: creating match; then: error is thrown', () => {
    it('should reject invalid date', () => {
      expect(() => new Match({
        id: 117,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('invalid-date'),
        status: 'PLANNED',
      })).toThrow('Match date must be a valid date.');
    });

    it('should reject NaN date', () => {
      expect(() => new Match({
        id: 118,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date(NaN),
        status: 'PLANNED',
      })).toThrow('Match date must be a valid date.');
    });
  });

  describe('given: invalid status; when: creating match; then: error is thrown', () => {
    it('should reject invalid status string', () => {
      expect(() => new Match({
        id: 119,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'INVALID_STATUS' as any,
      })).toThrow('Match status is invalid.');
    });

    it('should reject lowercase status', () => {
      expect(() => new Match({
        id: 120,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'planned' as any,
      })).toThrow('Match status is invalid.');
    });
  });

  describe('given: invalid home score; when: creating match; then: error is thrown', () => {
    it('should reject negative home score', () => {
      expect(() => new Match({
        id: 121,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: -1,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'IN_PROGRESS',
      })).toThrow('Home score must be a non-negative integer.');
    });

    it('should reject floating point home score', () => {
      expect(() => new Match({
        id: 122,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: 2.5,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'IN_PROGRESS',
      })).toThrow('Home score must be a non-negative integer.');
    });
  });

  describe('given: invalid away score; when: creating match; then: error is thrown', () => {
    it('should reject negative away score', () => {
      expect(() => new Match({
        id: 123,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: -1,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'IN_PROGRESS',
      })).toThrow('Away score must be a non-negative integer.');
    });

    it('should reject floating point away score', () => {
      expect(() => new Match({
        id: 124,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: 3.7,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'IN_PROGRESS',
      })).toThrow('Away score must be a non-negative integer.');
    });
  });

  describe('given: match properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const match = new Match({
        id: 125,
        roundOrderNumber: 1,
        roundName: '8th Final',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });

      expect(match.id).toBe(125);
      expect(match.status).toBe('PLANNED');
      expect(match.homeScore).toBeNull();
    });
  });

  describe('given: various round configurations; when: creating matches; then: all are accepted', () => {
    it('should accept round names like "8th Final", "Quarterfinal", "Semifinal", "Final"', () => {
      const roundNames = ['8th Final', 'Quarterfinal', 'Semifinal', 'Final'];

      roundNames.forEach((roundName) => {
        const match = new Match({
          id: 200,
          roundOrderNumber: 1,
          roundName,
          homeTeamName: 'Argentina',
          awayTeamName: 'Brazil',
          refereeUsername: null,
          homeScore: null,
          awayScore: null,
          matchDate: new Date('2026-06-15T18:00:00Z'),
          status: 'PLANNED',
        });
        expect(match.roundName).toBe(roundName);
      });
    });

    it('should accept high round order numbers', () => {
      const match = new Match({
        id: 126,
        roundOrderNumber: 100,
        roundName: 'Final Round',
        homeTeamName: 'Argentina',
        awayTeamName: 'Brazil',
        refereeUsername: null,
        homeScore: null,
        awayScore: null,
        matchDate: new Date('2026-06-15T18:00:00Z'),
        status: 'PLANNED',
      });
      expect(match.roundOrderNumber).toBe(100);
    });
  });
});
