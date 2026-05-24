export type Locale = 'en' | 'nl';

export type UserRole = 'ADMIN' | 'ORGANIZER' | 'VIEWER';

export type AuthUser = {
    id: string;
    username: string;
    role: UserRole;
};

export type AuthSession = {
    user: AuthUser;
    token: string;
};

export type Tournament = {
    id: string;
    name: string;
    year: number;
    format: string;
    createdAt: string;
    updatedAt: string;
};

export type Team = {
    id: string;
    name: string;
    country: string;
    coach: string;
    createdAt: string;
    updatedAt: string;
};

export type Round = {
    id: string;
    tournamentId: string;
    name: string;
    orderNumber: number;
    createdAt: string;
    updatedAt: string;
};

export type MatchStatus = 'SCHEDULED' | 'COMPLETED';

export type Match = {
    id: string;
    tournamentId: string;
    roundId: string;
    homeTeamId: string;
    awayTeamId: string;
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

export type TournamentOverview = {
    tournament: Tournament;
    teams: Team[];
    rounds: Round[];
    matches: Match[];
    standings: StandingRow[];
};

export type ApiEnvelope<T> = {
    data: T;
    message?: string;
};

export type LoginInput = {
    username: string;
    password: string;
};

export type RegisterInput = LoginInput & {
    role?: UserRole;
};

export type TournamentInput = {
    name: string;
    year: number;
    format: string;
};

export type TeamInput = {
    name: string;
    country: string;
    coach: string;
};

export type RoundInput = {
    name: string;
    orderNumber: number;
};

export type MatchInput = {
    roundId: string;
    homeTeamId: string;
    awayTeamId: string;
    matchDate: string;
};

export type MatchResultInput = {
    homeScore: number;
    awayScore: number;
    status?: MatchStatus;
};