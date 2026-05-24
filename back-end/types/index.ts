export type UserRole = 'ADMIN' | 'ORGANIZER' | 'REFEREE' | 'VIEWER';

export type MatchStatus = 'SCHEDULED' | 'COMPLETED';

export type AuthUser = {
    id: string;
    username: string;
    role: UserRole;
};

export type RegisterDto = {
    username: string;
    password: string;
    role?: UserRole;
};

export type LoginDto = {
    username: string;
    password: string;
};

export type TournamentCreateDto = {
    name: string;
    year: number;
    format: string;
};

export type TournamentUpdateDto = Partial<TournamentCreateDto>;

export type TeamCreateDto = {
    name: string;
    country: string;
    coach: string;
};

export type RoundCreateDto = {
    tournamentId: string;
    name: string;
    orderNumber: number;
};

export type MatchCreateDto = {
    tournamentId: string;
    roundId: string;
    homeTeamId: string;
    awayTeamId: string;
    matchDate: string;
    refereeId?: string;
};

export type MatchResultDto = {
    homeScore: number;
    awayScore: number;
    status?: MatchStatus;
};

export type RegisterTeamDto = {
    teamId: string;
};

export type TournamentResponse = {
    id: string;
    name: string;
    year: number;
    format: string;
    createdAt: string;
    updatedAt: string;
};

export type TeamResponse = {
    id: string;
    name: string;
    country: string;
    coach: string;
    createdAt: string;
    updatedAt: string;
};

export type RoundResponse = {
    id: string;
    tournamentId: string;
    name: string;
    orderNumber: number;
    createdAt: string;
    updatedAt: string;
};

export type MatchResponse = {
    id: string;
    tournamentId: string;
    roundId: string;
    homeTeamId: string;
    awayTeamId: string;
    refereeId: string | null;
    homeScore: number | null;
    awayScore: number | null;
    matchDate: string;
    status: MatchStatus;
    createdAt: string;
    updatedAt: string;
};

export type StandingsRow = {
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