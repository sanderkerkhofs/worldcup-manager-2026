import { Player } from '../../model/player';
import { ValidationError } from '../../util/errors';

describe('Player domain model', () => {
  describe('given: valid player data; when: creating a player; then: player is created successfully', () => {
    it('should create a player with all valid fields', () => {
      const player = new Player({
        id: 1,
        teamName: 'Argentina',
        firstName: 'Lionel',
        lastName: 'Messi',
        shirtNumber: 10,
        position: 'Forward',
      });

      expect(player.id).toBe(1);
      expect(player.teamName).toBe('Argentina');
      expect(player.firstName).toBe('Lionel');
      expect(player.lastName).toBe('Messi');
      expect(player.shirtNumber).toBe(10);
      expect(player.position).toBe('Forward');
      expect(player.createdAt).toBeInstanceOf(Date);
      expect(player.updatedAt).toBeInstanceOf(Date);
    });

    it('should create player with various positions', () => {
      const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'];
      
      positions.forEach((position, index) => {
        const player = new Player({
          id: index + 1,
          teamName: 'Argentina',
          firstName: 'Test',
          lastName: 'Player',
          shirtNumber: 1,
          position,
        });
        expect(player.position).toBe(position);
      });
    });

    it('should create player with shirt numbers 1 through 99', () => {
      [1, 5, 11, 23, 50, 99].forEach((shirtNumber) => {
        const player = new Player({
          id: shirtNumber,
          teamName: 'Argentina',
          firstName: 'Test',
          lastName: 'Player',
          shirtNumber,
          position: 'Midfielder',
        });
        expect(player.shirtNumber).toBe(shirtNumber);
      });
    });

    it('should auto-generate timestamps when not provided', () => {
      const before = new Date();
      const player = new Player({
        id: 2,
        teamName: 'Argentina',
        firstName: 'John',
        lastName: 'Doe',
        shirtNumber: 7,
        position: 'Forward',
      });
      const after = new Date();

      expect(player.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(player.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(player.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(player.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamps', () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const updatedAt = new Date('2026-02-01T00:00:00Z');
      const player = new Player({
        id: 3,
        teamName: 'Argentina',
        firstName: 'Historical',
        lastName: 'Player',
        shirtNumber: 5,
        position: 'Defender',
        createdAt,
        updatedAt,
      });

      expect(player.createdAt).toEqual(createdAt);
      expect(player.updatedAt).toEqual(updatedAt);
    });
  });

  describe('given: invalid teamId; when: creating player; then: error is thrown', () => {
    it('should reject empty teamId', () => {
      expect(() => new Player({
        id: 4,
        teamName: '',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow(ValidationError);
      expect(() => new Player({
        id: 4,
        teamName: '',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player must belong to a team.');
    });

    it('should reject whitespace-only teamId', () => {
      expect(() => new Player({
        id: 5,
        teamName: '   ',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player must belong to a team.');
    });
  });

  describe('given: invalid player name; when: creating player; then: error is thrown', () => {
    it('should reject empty firstName', () => {
      expect(() => new Player({
        id: 6,
        teamName: 'Argentina',
        firstName: '',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow(ValidationError);
      expect(() => new Player({
        id: 6,
        teamName: 'Argentina',
        firstName: '',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player name is required.');
    });

    it('should reject whitespace-only firstName', () => {
      expect(() => new Player({
        id: 7,
        teamName: 'Argentina',
        firstName: '   ',
        lastName: 'Player',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player name is required.');
    });

    it('should reject empty lastName', () => {
      expect(() => new Player({
        id: 8,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: '',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player name is required.');
    });

    it('should reject whitespace-only lastName', () => {
      expect(() => new Player({
        id: 9,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: '   ',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player name is required.');
    });

    it('should reject both empty firstName and lastName', () => {
      expect(() => new Player({
        id: 10,
        teamName: 'Argentina',
        firstName: '',
        lastName: '',
        shirtNumber: 1,
        position: 'Forward',
      })).toThrow('Player name is required.');
    });
  });

  describe('given: invalid shirt number; when: creating player; then: error is thrown', () => {
    it('should reject zero shirt number', () => {
      expect(() => new Player({
        id: 11,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 0,
        position: 'Forward',
      })).toThrow(ValidationError);
      expect(() => new Player({
        id: 11,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 0,
        position: 'Forward',
      })).toThrow('Shirt number must be a positive integer.');
    });

    it('should reject negative shirt number', () => {
      expect(() => new Player({
        id: 12,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: -5,
        position: 'Forward',
      })).toThrow('Shirt number must be a positive integer.');
    });

    it('should reject floating point shirt number', () => {
      expect(() => new Player({
        id: 13,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 7.5,
        position: 'Forward',
      })).toThrow('Shirt number must be a positive integer.');
    });

    it('should reject non-integer shirt number', () => {
      expect(() => new Player({
        id: 14,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: NaN,
        position: 'Forward',
      })).toThrow('Shirt number must be a positive integer.');
    });
  });

  describe('given: invalid position; when: creating player; then: error is thrown', () => {
    it('should reject empty position', () => {
      expect(() => new Player({
        id: 15,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: '',
      })).toThrow(ValidationError);
      expect(() => new Player({
        id: 15,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: '',
      })).toThrow('Player position is required.');
    });

    it('should reject whitespace-only position', () => {
      expect(() => new Player({
        id: 16,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 1,
        position: '   ',
      })).toThrow('Player position is required.');
    });
  });

  describe('given: prisma player object; when: converting to Player; then: player is created from prisma data', () => {
    it('should create Player from Prisma player object', () => {
      const prismaPlayer = {
        id: 17,
        teamName: 'Argentina',
        firstName: 'Cristiano',
        lastName: 'Ronaldo',
        shirtNumber: 7,
        position: 'Forward',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      };

      const player = Player.from(prismaPlayer);

      expect(player.id).toBe(17);
      expect(player.teamName).toBe('Argentina');
      expect(player.firstName).toBe('Cristiano');
      expect(player.lastName).toBe('Ronaldo');
      expect(player.shirtNumber).toBe(7);
      expect(player.position).toBe('Forward');
      expect(player.createdAt).toEqual(prismaPlayer.createdAt);
      expect(player.updatedAt).toEqual(prismaPlayer.updatedAt);
    });
  });

  describe('given: player properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const player = new Player({
        id: 18,
        teamName: 'Argentina',
        firstName: 'Test',
        lastName: 'Player',
        shirtNumber: 10,
        position: 'Midfielder',
      });

      expect(player.id).toBe(18);
      expect(player.shirtNumber).toBe(10);
      expect(player.position).toBe('Midfielder');
    });
  });

  describe('given: player with common names; when: creating; then: names are accepted', () => {
    it('should accept single character names', () => {
      const player = new Player({
        id: 19,
        teamName: 'Argentina',
        firstName: 'A',
        lastName: 'B',
        shirtNumber: 1,
        position: 'Forward',
      });
      expect(player.firstName).toBe('A');
      expect(player.lastName).toBe('B');
    });

    it('should accept names with hyphens and apostrophes', () => {
      const player = new Player({
        id: 20,
        teamName: 'Argentina',
        firstName: "Jean-Marie",
        lastName: "O'Neill",
        shirtNumber: 1,
        position: 'Forward',
      });
      expect(player.firstName).toBe("Jean-Marie");
      expect(player.lastName).toBe("O'Neill");
    });

    it('should accept long names', () => {
      const player = new Player({
        id: 21,
        teamName: 'Argentina',
        firstName: 'Alexanderplatzbyzantine',
        lastName: 'Maximiliangonzalezrodriguez',
        shirtNumber: 1,
        position: 'Forward',
      });
      expect(player.firstName).toBe('Alexanderplatzbyzantine');
      expect(player.lastName).toBe('Maximiliangonzalezrodriguez');
    });
  });
});
