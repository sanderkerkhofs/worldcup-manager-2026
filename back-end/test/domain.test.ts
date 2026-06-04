import { Team } from '../model/team';
import { Player } from '../model/player';
import { Match } from '../model/match';

describe('Team domain validation', () => {
  it('creates a valid team', () => {
    const team = new Team({
      name: 'Argentina',
      country: 'Argentina',
      countryShortName: 'ARG',
      countryFlag: '🇦🇷',
    });

    expect(team.name).toBe('Argentina');
    expect(team.country).toBe('Argentina');
  });

  it('rejects an empty team name', () => {
    expect(() => new Team({
      name: '   ',
      country: 'Argentina',
      countryShortName: 'ARG',
      countryFlag: '🇦🇷',
    })).toThrow('Team name is required.');
  });
});

describe('Player domain validation', () => {
  it('creates a valid player', () => {
    const player = new Player({
      id: 1,
      teamName: 'Argentina',
      firstName: 'Lionel',
      lastName: 'Messi',
      shirtNumber: 10,
      position: 'Forward',
    });

    expect(player.shirtNumber).toBe(10);
  });

  it('rejects an invalid shirt number', () => {
    expect(() => new Player({
      id: 2,
      teamName: 'Argentina',
      firstName: 'Test',
      lastName: 'Player',
      shirtNumber: 0,
      position: 'Midfielder',
    })).toThrow('Shirt number must be a positive integer.');
  });
});

describe('Match domain validation', () => {
  it('creates a valid match', () => {
    const match = new Match({
      id: 1,
      roundOrderNumber: 1,
      roundName: '8th Final',
      homeTeamName: 'Argentina',
      awayTeamName: 'Brazil',
      refereeUsername: null,
      homeScore: null,
      awayScore: null,
      matchDate: new Date('2026-05-10T18:00:00.000Z'),
      status: 'PLANNED',
    });

    expect(match.homeTeamName).toBe('Argentina');
    expect(match.status).toBe('PLANNED');
  });

  it('rejects matches where the same team plays itself', () => {
    expect(() => new Match({
      id: 2,
      roundOrderNumber: 1,
      roundName: '8th Final',
      homeTeamName: 'Argentina',
      awayTeamName: 'Argentina',
      refereeUsername: null,
      homeScore: null,
      awayScore: null,
      matchDate: new Date('2026-05-10T18:00:00.000Z'),
      status: 'PLANNED',
    })).toThrow('Home team and away team must be different.');
  });
});
