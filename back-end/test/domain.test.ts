import { Tournament } from '../model/tournament';
import { Match } from '../model/match';

describe('Tournament domain validation', () => {
    it('creates a valid tournament', () => {
        const tournament = new Tournament({
            id: 'tournament-1',
            name: 'Campus Cup',
            year: 2026,
            format: 'League',
        });

        expect(tournament.name).toBe('Campus Cup');
        expect(tournament.year).toBe(2026);
    });

    it('rejects an empty tournament name', () => {
        expect(() => new Tournament({
            id: 'tournament-2',
            name: '   ',
            year: 2026,
            format: 'League',
        })).toThrow('Tournament name is required.');
    });
});

describe('Match domain validation', () => {
    it('creates a valid match', () => {
        const match = new Match({
            id: 'match-1',
            tournamentId: 'tournament-1',
            roundId: 'round-1',
            homeTeamId: 'team-1',
            awayTeamId: 'team-2',
            refereeId: null,
            homeScore: null,
            awayScore: null,
            matchDate: new Date('2026-05-10T18:00:00.000Z'),
            status: 'SCHEDULED',
        });

        expect(match.homeTeamId).toBe('team-1');
        expect(match.status).toBe('SCHEDULED');
    });

    it('rejects matches where the same team plays itself', () => {
        expect(() => new Match({
            id: 'match-2',
            tournamentId: 'tournament-1',
            roundId: 'round-1',
            homeTeamId: 'team-1',
            awayTeamId: 'team-1',
            refereeId: null,
            homeScore: null,
            awayScore: null,
            matchDate: new Date('2026-05-10T18:00:00.000Z'),
            status: 'SCHEDULED',
        })).toThrow('Home team and away team must be different.');
    });
});