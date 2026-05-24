import { CompetitionMetadata } from '../types';

export const competition: CompetitionMetadata = {
  name: 'worldcup-manager-2026',
  year: 2026,
  hostCountry: 'United States, Canada, Mexico',
  format: 'Knockout',
};

export const fixedRounds = [
  { name: '8th Final', orderNumber: 1 },
  { name: 'Quarterfinal', orderNumber: 2 },
  { name: 'Semifinal', orderNumber: 3 },
  { name: 'Final', orderNumber: 4 },
] as const;

export const fixedRoundMatchCounts = [8, 4, 2, 1] as const;

export const seededPlayersPerTeam = 15;
