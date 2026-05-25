import { prisma } from '../repository/prisma/client';
import { competition, fixedRounds } from '../util/competition';
import { Match } from '../model/match';
import { Team } from '../model/team';
import { Player } from '../model/player';
import { Goal } from '../model/goal';
import { CompetitionOverviewResponse, GoalInputDto, MatchResponse, RoundResponse, RoundSimulationResponse, StandingRow, TopScorerRow } from '../types';
import { NotFoundError, ValidationError } from '../util/errors';
import { createNextRoundMatchesIfReady } from './roundProgressionService';
import { getCountryFlagFromShortName } from '../util/country';

function roundIdFromOrder(orderNumber: number): string {
  return String(orderNumber);
}

function resolveRoundByIdentifier(roundId: string) {
  const numericId = Number.parseInt(roundId.replace(/^round-/i, ''), 10);

  if (Number.isInteger(numericId) && numericId > 0) {
    return fixedRounds.find((round) => round.orderNumber === numericId) ?? null;
  }

  return fixedRounds.find((round) => round.name.toLowerCase() === roundId.toLowerCase()) ?? null;
}

function buildRoundResponse(round: { name: string; orderNumber: number }, matches: Array<{ createdAt: Date; updatedAt: Date }>): RoundResponse {
  const createdAt = matches.length > 0
    ? new Date(Math.min(...matches.map((match) => match.createdAt.getTime())))
    : new Date();
  const updatedAt = matches.length > 0
    ? new Date(Math.max(...matches.map((match) => match.updatedAt.getTime())))
    : new Date();

  return {
    id: roundIdFromOrder(round.orderNumber),
    name: round.name,
    orderNumber: round.orderNumber,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

function createStandingRow(team: Team): StandingRow {
  return {
    teamId: team.id,
    teamName: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function calculateStandings(matches: Match[], teams: Team[]): StandingRow[] {
  const rows = new Map<string, StandingRow>(teams.map((team) => [team.id, createStandingRow(team)]));

  for (const match of matches) {
    if (match.status !== 'COMPLETED' || match.homeScore === null || match.awayScore === null || !match.homeTeamId || !match.awayTeamId) {
      continue;
    }

    const homeRow = rows.get(match.homeTeamId);
    const awayRow = rows.get(match.awayTeamId);

    if (!homeRow || !awayRow) {
      continue;
    }

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += match.homeScore;
    homeRow.goalsAgainst += match.awayScore;
    awayRow.goalsFor += match.awayScore;
    awayRow.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeRow.won += 1;
      awayRow.lost += 1;
      homeRow.points += 3;
    } else if (match.homeScore < match.awayScore) {
      awayRow.won += 1;
      homeRow.lost += 1;
      awayRow.points += 3;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      return right.goalDifference - left.goalDifference;
    });
}

function calculateTopScorers(goals: Goal[], players: Player[], teams: Team[]): TopScorerRow[] {
  const scorerMap = new Map<string, TopScorerRow>();

  for (const goal of goals) {
    const player = players.find((candidate) => candidate.id === goal.playerId);
    const team = teams.find((candidate) => candidate.id === goal.teamId);

    if (!player || !team) {
      continue;
    }

    const current = scorerMap.get(player.id) ?? {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamId: team.id,
      teamName: team.name,
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    current.goals += 1;
    scorerMap.set(player.id, current);
  }

  return Array.from(scorerMap.values()).sort((left, right) => right.goals - left.goals);
}

function randomInt(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function buildGoalsForMatch(match: Match, playersByTeam: Map<string, Player[]>): GoalInputDto[] {
  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError('Cannot simulate a match without both teams assigned.');
  }

  const homeTeamId = match.homeTeamId as string;
  const awayTeamId = match.awayTeamId as string;

  let homeScore = 0;
  let awayScore = 0;

  do {
    const totalGoals = randomInt(1, 6);
    homeScore = randomInt(0, totalGoals);
    awayScore = totalGoals - homeScore;
  } while ((homeScore === 0 && awayScore === 0) || homeScore === awayScore);

  const goalTeams: string[] = shuffle([
    ...Array.from({ length: homeScore }, () => homeTeamId),
    ...Array.from({ length: awayScore }, () => awayTeamId),
  ]);

  const minutes = new Set<number>();

  while (minutes.size < goalTeams.length) {
    minutes.add(randomInt(1, 90));
  }

  const sortedMinutes = Array.from(minutes).sort((left, right) => left - right);

  return goalTeams.map((teamId, index) => {
    const teamPlayers = playersByTeam.get(teamId) ?? [];
    const availablePlayers = teamPlayers.filter((player) => player.status === 'AVAILABLE');
    const scorerPool = availablePlayers.length > 0 ? availablePlayers : teamPlayers;

    if (scorerPool.length === 0) {
      throw new ValidationError('Unable to simulate a goal without players for one of the teams.');
    }

    const scorer = scorerPool[randomInt(0, scorerPool.length - 1)];

    return {
      playerId: scorer.id,
      teamId,
      minute: sortedMinutes[index],
    };
  });
}

async function loadValidatedPreviousRound(orderNumber: number) {
  if (orderNumber === 1) {
    return null;
  }

  const previousRoundMatches = await prisma.match.findMany({
    where: { roundOrderNumber: orderNumber - 1 },
  });

  if (previousRoundMatches.length === 0) {
    throw new ValidationError('Previous round is missing.');
  }

  if (previousRoundMatches.some((match) => match.status !== 'COMPLETED')) {
    throw new ValidationError('Previous round must be completed before this round can be started or simulated.');
  }

  return orderNumber - 1;
}

function hasPlayableTeams(match: { homeTeamId: string | null; awayTeamId: string | null }) {
  return !!match.homeTeamId && !!match.awayTeamId;
}

export async function getCompetitionOverview(): Promise<CompetitionOverviewResponse> {
  const [teams, matches, players, goals, referees] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: 'asc' } }),
    prisma.match.findMany({ orderBy: { matchDate: 'asc' } }),
    prisma.player.findMany({ orderBy: [{ teamId: 'asc' }, { shirtNumber: 'asc' }] }),
    prisma.goal.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.user.findMany({ where: { role: 'REFEREE' }, select: { id: true, username: true, countryShortName: true } }),
  ]);

  const teamModels = teams.map((team) => Team.from(team));
  const matchModels = matches.map((match) => Match.from(match));
  const playerModels = players.map((player) => Player.from(player));
  const goalModels = goals.map((goal) => Goal.from(goal));
  const teamById = new Map(teamModels.map((team) => [team.id, team]));
  const refereeById = new Map(referees.map((referee) => [referee.id, referee]));
  const rounds = fixedRounds.map((round) => buildRoundResponse(round, matches.filter((match) => match.roundOrderNumber === round.orderNumber)));

  return {
    competition,
    teams: teamModels.map((team) => ({
      id: team.id,
      name: team.name,
      country: team.country,
      countryShortName: team.countryShortName,
      countryFlag: team.countryFlag,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    })),
    rounds,
    matches: matchModels.map((match) => ({
      id: match.id,
      roundId: match.roundId,
      roundOrderNumber: match.roundOrderNumber,
      roundName: match.roundName,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      refereeId: match.refereeId,
      refereeName: match.refereeId ? (refereeById.get(match.refereeId)?.username.replace(/_/g, ' ') ?? null) : null,
      refereeCountryFlag: match.refereeId ? getCountryFlagFromShortName(refereeById.get(match.refereeId)?.countryShortName) : null,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate.toISOString(),
      status: match.status,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    })),
    standings: calculateStandings(matchModels, teamModels),
    topScorers: calculateTopScorers(goalModels, playerModels, teamModels),
  };
}

export async function listRounds() {
  const matches = await prisma.match.findMany({
    select: { roundOrderNumber: true, roundName: true, createdAt: true, updatedAt: true },
    orderBy: { roundOrderNumber: 'asc' },
  });

  return fixedRounds.map((round) => {
    const roundMatches = matches.filter((match) => match.roundOrderNumber === round.orderNumber);
    const resolvedName = roundMatches[0]?.roundName ?? round.name;

    return buildRoundResponse({ name: resolvedName, orderNumber: round.orderNumber }, roundMatches);
  });
}

export async function simulateRound(roundId: string): Promise<RoundSimulationResponse> {
  const activeRound = resolveRoundByIdentifier(roundId);

  if (!activeRound) {
    throw new NotFoundError('Round was not found.');
  }

  const activeRoundMatches = await prisma.match.findMany({
    where: { roundOrderNumber: activeRound.orderNumber },
    orderBy: { matchDate: 'asc' },
  });

  await loadValidatedPreviousRound(activeRound.orderNumber);

  if (activeRoundMatches.length === 0) {
    throw new ValidationError('Round does not contain any pre-seeded matches to simulate.');
  }

  if (activeRoundMatches.some((match) => !hasPlayableTeams(match))) {
    throw new ValidationError('Round cannot be simulated yet because participant teams are not known.');
  }

  const teamsInRound = new Set<string>();

  for (const match of activeRoundMatches) {
    if (!match.homeTeamId || !match.awayTeamId) {
      throw new ValidationError('Round cannot be simulated yet because participant teams are not known.');
    }

    teamsInRound.add(match.homeTeamId);
    teamsInRound.add(match.awayTeamId);
  }

  const players = await prisma.player.findMany({
    where: { teamId: { in: Array.from(teamsInRound) } },
    orderBy: [{ teamId: 'asc' }, { shirtNumber: 'asc' }],
  });

  const playersByTeam = new Map<string, Player[]>();

  for (const player of players.map((item) => Player.from(item))) {
    const existing = playersByTeam.get(player.teamId) ?? [];
    existing.push(player);
    playersByTeam.set(player.teamId, existing);
  }

  const updatedMatches: Match[] = [];
  let goalsCreated = 0;

  await prisma.$transaction(async (transaction) => {
    await transaction.goal.deleteMany({ where: { matchId: { in: activeRoundMatches.map((match) => match.id) } } });

    for (const match of activeRoundMatches) {
      const goals = buildGoalsForMatch(Match.from(match), playersByTeam);
      const homeScore = goals.filter((goal) => goal.teamId === match.homeTeamId).length;
      const awayScore = goals.filter((goal) => goal.teamId === match.awayTeamId).length;

      if (goals.length > 0) {
        await transaction.goal.createMany({
          data: goals.map((goal) => ({
            matchId: match.id,
            playerId: goal.playerId,
            teamId: goal.teamId,
            minute: goal.minute,
          })),
        });
      }

      const updatedMatch = await transaction.match.update({
        where: { id: match.id },
        data: {
          homeScore,
          awayScore,
          status: 'COMPLETED',
        },
      });

      updatedMatches.push(Match.from(updatedMatch));
      goalsCreated += goals.length;
    }
  });

  await createNextRoundMatchesIfReady(roundIdFromOrder(activeRound.orderNumber));

  const [referees] = await Promise.all([
    prisma.user.findMany({ where: { role: 'REFEREE' }, select: { id: true, username: true, countryShortName: true } }),
  ]);

  const refereeNameById = new Map(referees.map((referee) => [referee.id, referee.username.replace(/_/g, ' ')]));

  return {
    round: buildRoundResponse(activeRound, updatedMatches),
    matches: updatedMatches.map((match) => ({
      id: match.id,
      roundId: match.roundId,
      roundOrderNumber: match.roundOrderNumber,
      roundName: match.roundName,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      refereeId: match.refereeId,
      refereeName: match.refereeId ? refereeNameById.get(match.refereeId) ?? null : null,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate.toISOString(),
      status: match.status,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    })),
    goalsCreated,
  };
}
