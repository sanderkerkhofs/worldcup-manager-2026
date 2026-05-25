export type UserRole = 'ADMIN' | 'REFEREE' | 'GUEST';

export type MatchStatus = 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'COMPLETED';

export type PlayerStatus = 'AVAILABLE' | 'UNAVAILABLE';

export type CompetitionMetadata = {
  name: string;
  year: number;
  hostCountry: string;
  format: string;
};

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  countryShortName: string | null;
  countryFlag: string | null;
  teamId: string | null;
};

export type RegisterDto = {
  username: string;
  password: string;
  role?: 'GUEST';
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
  teamId: string;
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  status?: PlayerStatus;
};

export type PlayerUpdateDto = Partial<Omit<PlayerCreateDto, 'teamId'>>;

export type PlayerStatusDto = {
  status: PlayerStatus;
};

export type RoundCreateDto = {
  name: string;
  orderNumber: number;
};

export type MatchCreateDto = {
  roundId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  refereeId?: string | null;
};

export type GoalInputDto = {
  playerId: string;
  teamId: string;
  minute: number;
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

export type UserResponse = {
  id: string;
  username: string;
  role: UserRole;
  countryShortName: string | null;
  countryFlag: string | null;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamResponse = {
  id: string;
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};

export type PlayerResponse = {
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

export type RoundResponse = {
  id: string;
  name: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type GoalResponse = {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  minute: number;
  createdAt: string;
};

export type MatchResponse = {
  id: string;
  roundId: string;
  roundOrderNumber: number;
  roundName: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  refereeId: string | null;
  refereeName: string | null;
  refereeCountryFlag?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
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

export type CompetitionOverviewResponse = {
  competition: CompetitionMetadata;
  teams: TeamResponse[];
  rounds: RoundResponse[];
  matches: MatchResponse[];
  standings: StandingRow[];
  topScorers: TopScorerRow[];
};
