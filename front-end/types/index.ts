export type UserRole = 'ADMIN' | 'REFEREE' | 'USER' | 'GUEST';
export type PlayerStatus = 'AVAILABLE' | 'UNAVAILABLE';
export type MatchStatus = 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED';

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  teamId: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type Team = {
  id: string;
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};

export type Player = {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  status: PlayerStatus;
  createdAt: string;
  updatedAt: string;
};

export type Round = {
  id: string;
  name: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: string;
  roundId: string;
  roundOrderNumber: number;
  roundName: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  refereeId: string | null;
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
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  createdAt: string;
};

export type MatchGoal = {
  id: string;
  playerId: string;
  teamId: string;
  playerName: string;
  teamName: string;
  teamCountryFlag: string;
  createdAt: string;
};

export type MatchCreateInput = {
  roundId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  refereeId?: string | null;
};

export type GoalInput = {
  playerId: string;
  teamId: string;
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
  teamId: string;
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
  playerId: string;
  playerName: string;
  teamId: string;
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
