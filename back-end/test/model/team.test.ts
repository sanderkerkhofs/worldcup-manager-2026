import { Team } from '../../model/team';
import { ValidationError } from '../../util/errors';

describe('Team domain model', () => {
  describe('given: valid team data; when: creating a team; then: team is created successfully', () => {
    it('should create a team with all valid fields', () => {
      const team = new Team({
        name: 'Argentina',
        country: 'Argentina',
        countryShortName: 'ARG',
        countryFlag: '🇦🇷',
      });
expect(team.name).toBe('Argentina');
      expect(team.country).toBe('Argentina');
      expect(team.countryShortName).toBe('ARG');
      expect(team.countryFlag).toBe('🇦🇷');
      expect(team.createdAt).toBeInstanceOf(Date);
      expect(team.updatedAt).toBeInstanceOf(Date);
    });

    it('should create teams with various names and countries', () => {
      const teams = [
        { name: 'Brazil', country: 'Brazil', shortName: 'BRA', flag: '🇧🇷' },
        { name: 'France', country: 'France', shortName: 'FRA', flag: '🇫🇷' },
        { name: 'Germany', country: 'Germany', shortName: 'GER', flag: '🇩🇪' },
        { name: 'Italy', country: 'Italy', shortName: 'ITA', flag: '🇮🇹' },
        { name: 'Netherlands', country: 'Netherlands', shortName: 'NED', flag: '🇳🇱' },
      ];

      teams.forEach((teamData) => {
        const team = new Team({
          name: teamData.name,
          country: teamData.country,
          countryShortName: teamData.shortName,
          countryFlag: teamData.flag,
        });

        expect(team.name).toBe(teamData.name);
        expect(team.country).toBe(teamData.country);
        expect(team.countryShortName).toBe(teamData.shortName);
        expect(team.countryFlag).toBe(teamData.flag);
      });
    });

    it('should auto-generate timestamps when not provided', () => {
      const before = new Date();
      const team = new Team({
        name: 'Spain',
        country: 'Spain',
        countryShortName: 'ESP',
        countryFlag: '🇪🇸',
      });
      const after = new Date();

      expect(team.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(team.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(team.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(team.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamps', () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const updatedAt = new Date('2026-02-01T00:00:00Z');
      const team = new Team({
        name: 'Portugal',
        country: 'Portugal',
        countryShortName: 'POR',
        countryFlag: '🇵🇹',
        createdAt,
        updatedAt,
      });

      expect(team.createdAt).toEqual(createdAt);
      expect(team.updatedAt).toEqual(updatedAt);
    });
  });

  describe('given: invalid team name; when: creating team; then: error is thrown', () => {
    it('should reject empty team name', () => {
      expect(() => new Team({
        name: '',
        country: 'Some Country',
        countryShortName: 'SC',
        countryFlag: '🚩',
      })).toThrow(ValidationError);
      expect(() => new Team({
        name: '',
        country: 'Some Country',
        countryShortName: 'SC',
        countryFlag: '🚩',
      })).toThrow('Team name is required.');
    });

    it('should reject whitespace-only team name', () => {
      expect(() => new Team({
        name: '   ',
        country: 'Some Country',
        countryShortName: 'SC',
        countryFlag: '🚩',
      })).toThrow('Team name is required.');
    });

    it('should reject tabs and newlines in team name', () => {
      expect(() => new Team({
        name: '\t\n',
        country: 'Some Country',
        countryShortName: 'SC',
        countryFlag: '🚩',
      })).toThrow('Team name is required.');
    });
  });

  describe('given: invalid country; when: creating team; then: error is thrown', () => {
    it('should reject empty country', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: '',
        countryShortName: 'TN',
        countryFlag: '🚩',
      })).toThrow(ValidationError);
      expect(() => new Team({
        name: 'Team Name',
        country: '',
        countryShortName: 'TN',
        countryFlag: '🚩',
      })).toThrow('Team country is required.');
    });

    it('should reject whitespace-only country', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: '   ',
        countryShortName: 'TN',
        countryFlag: '🚩',
      })).toThrow('Team country is required.');
    });
  });

  describe('given: invalid country short name; when: creating team; then: error is thrown', () => {
    it('should reject empty country short name', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: '',
        countryFlag: '🚩',
      })).toThrow(ValidationError);
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: '',
        countryFlag: '🚩',
      })).toThrow('Team country short name is required.');
    });

    it('should reject whitespace-only country short name', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: '   ',
        countryFlag: '🚩',
      })).toThrow('Team country short name is required.');
    });
  });

  describe('given: invalid country flag; when: creating team; then: error is thrown', () => {
    it('should reject empty country flag', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: 'TN',
        countryFlag: '',
      })).toThrow(ValidationError);
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: 'TN',
        countryFlag: '',
      })).toThrow('Team country flag is required.');
    });

    it('should reject whitespace-only country flag', () => {
      expect(() => new Team({
        name: 'Team Name',
        country: 'Some Country',
        countryShortName: 'TN',
        countryFlag: '   ',
      })).toThrow('Team country flag is required.');
    });
  });

  describe('given: multiple invalid fields; when: creating team; then: error is thrown for first validation', () => {
    it('should reject team with empty name and country', () => {
      expect(() => new Team({
        name: '',
        country: '',
        countryShortName: 'TN',
        countryFlag: '🚩',
      })).toThrow('Team name is required.');
    });
  });

  describe('given: prisma team object; when: converting to Team; then: team is created from prisma data', () => {
    it('should create Team from Prisma team object', () => {
      const prismaTeam = {
        id: 'team-14',
        name: 'Uruguay',
        country: 'Uruguay',
        countryShortName: 'URU',
        countryFlag: '🇺🇾',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      };

      const team = Team.from(prismaTeam);
expect(team.name).toBe('Uruguay');
      expect(team.country).toBe('Uruguay');
      expect(team.countryShortName).toBe('URU');
      expect(team.countryFlag).toBe('🇺🇾');
      expect(team.createdAt).toEqual(prismaTeam.createdAt);
      expect(team.updatedAt).toEqual(prismaTeam.updatedAt);
    });
  });

  describe('given: team properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const team = new Team({
        name: 'Mexico',
        country: 'Mexico',
        countryShortName: 'MEX',
        countryFlag: '🇲🇽',
      });
expect(team.name).toBe('Mexico');
      expect(team.country).toBe('Mexico');
    });
  });

  describe('given: team with various country short names; when: creating; then: names are accepted', () => {
    it('should accept 3-letter country codes', () => {
      const team = new Team({
        name: 'Test Team',
        country: 'Test Country',
        countryShortName: 'TST',
        countryFlag: '🚩',
      });
      expect(team.countryShortName).toBe('TST');
    });

    it('should accept 2-letter country codes', () => {
      const team = new Team({
        name: 'Test Team',
        country: 'Test Country',
        countryShortName: 'TS',
        countryFlag: '🚩',
      });
      expect(team.countryShortName).toBe('TS');
    });

    it('should accept single character codes', () => {
      const team = new Team({
        name: 'Test Team',
        country: 'Test Country',
        countryShortName: 'T',
        countryFlag: '🚩',
      });
      expect(team.countryShortName).toBe('T');
    });

    it('should accept long country names', () => {
      const team = new Team({
        name: 'Democratic Republic of the Congo',
        country: 'Democratic Republic of the Congo',
        countryShortName: 'DRC',
        countryFlag: '🇨🇩',
      });
      expect(team.name).toBe('Democratic Republic of the Congo');
      expect(team.country).toBe('Democratic Republic of the Congo');
    });
  });

  describe('given: team with flag emoji; when: creating; then: emoji flags are accepted', () => {
    it('should accept all types of emoji flags', () => {
      const flags = ['🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇮🇹', '🇳🇱', '🇪🇸', '🇵🇹', '🇺🇾', '🇲🇽'];
      
      flags.forEach((flag, index) => {
        const team = new Team({
          name: 'Test Team',
          country: 'Test Country',
          countryShortName: 'TS',
          countryFlag: flag,
        });
        expect(team.countryFlag).toBe(flag);
      });
    });

    it('should accept custom flag characters', () => {
      const team = new Team({
        name: 'Test Team',
        country: 'Test Country',
        countryShortName: 'TS',
        countryFlag: '⚽',
      });
      expect(team.countryFlag).toBe('⚽');
    });
  });
});
