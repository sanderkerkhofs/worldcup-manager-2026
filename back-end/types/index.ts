export type UserRole = 'ADMIN' | 'REFEREE' | 'USER' | 'GUEST';

export type MatchStatus = 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export type CompetitionMetadata = {
  name: string;
  year: number;
  hostCountry: string;
  format: string;
};

export type AuthUser = {
  username: string;
  role: UserRole;
  teamName: string | null;
};

export type RegisterDto = {
  username: string;
  password: string;
  role?: 'USER';
};

export type LoginDto = {
  username: string;
  password: string;
};

export type TeamCreateDto = {
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
};

export type TeamUpdateDto = Partial<TeamCreateDto>;

export type PlayerCreateDto = {
  teamName: string;
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
};

export type PlayerUpdateDto = Partial<Omit<PlayerCreateDto, 'teamName'>>;

export type RoundCreateDto = {
  name: string;
  orderNumber: number;
};

export type MatchCreateDto = {
  roundId: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
  refereeUsername?: string | null;
};

export type GoalInputDto = {
  playerId: number;
  teamName: string;
};

export type MatchStatusDto = {
  status: MatchStatus;
};

export type MatchResultDto = {
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  goals?: GoalInputDto[];
};

export type RoundSimulationResponse = {
  round: RoundResponse;
  matches: MatchResponse[];
  goalsCreated: number;
};

export type TournamentResetResponse = {
  goalsDeleted: number;
  firstRoundMatchesReset: number;
  futureRoundMatchesReset: number;
};

export type UserResponse = {
  username: string;
  role: UserRole;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamResponse = {
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};

export type PlayerResponse = {
  id: number;
  teamName: string;
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  createdAt: string;
  updatedAt: string;
};

export type RoundResponse = {
  name: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type GoalResponse = {
  id: number;
  matchId: number;
  playerId: number;
  teamName: string;
  createdAt: string;
};

export type MatchResponse = {
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
  createdAt: string;
  updatedAt: string;
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

export type CompetitionOverviewResponse = {
  competition: CompetitionMetadata;
  teams: TeamResponse[];
  rounds: RoundResponse[];
  matches: MatchResponse[];
  standings: StandingRow[];
  topScorers: TopScorerRow[];
};
