export type UserRole = 'ADMIN' | 'REFEREE' | 'USER' | 'GUEST';
export type MatchStatus = 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED';

export type AuthUser = {
  username: string;
  role: UserRole;
  teamName: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type Team = {
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};

export type Player = {
  id: number;
  teamName: string;
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  createdAt: string;
  updatedAt: string;
};

export type Round = {
  name: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: number;
  roundId: string;
  roundOrderNumber: number;
  roundName: string;
  homeTeamName: string | null;
  awayTeamName: string | null;
  refereeUsername: string | null;
  refereeName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: MatchStatus;
  goals?: MatchGoal[];
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: number;
  matchId: number;
  playerId: number;
  teamName: string;
  createdAt: string;
};

export type MatchGoal = {
  id: number;
  playerId: number;
  teamName: string;
  playerName: string;
  teamCountryFlag: string;
  createdAt: string;
};

export type MatchCreateInput = {
  roundId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
  refereeUsername?: string | null;
};

export type GoalInput = {
  playerId: number;
  teamName: string;
};

export type RoundSimulationResult = {
  round: Round;
  matches: Match[];
  goalsCreated: number;
};

export type TournamentResetResult = {
  goalsDeleted: number;
  firstRoundMatchesReset: number;
  futureRoundMatchesReset: number;
};

export type StandingRow = {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type TopScorerRow = {
  playerId: number;
  playerName: string;
  teamName: string;
  teamCountryFlag: string;
  goals: number;
};

export type CompetitionOverview = {
  competition: {
    name: string;
    year: number;
    hostCountry: string;
    format: string;
  };
  teams: Team[];
  rounds: Round[];
  matches: Match[];
  standings: StandingRow[];
  topScorers: TopScorerRow[];
};
