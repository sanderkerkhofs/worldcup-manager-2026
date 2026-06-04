import { prisma } from '../repository/prisma/client';
import { ForbiddenError, NotFoundError, ValidationError } from '../util/errors';
import { Match } from '../model/match';
import { Goal } from '../model/goal';
import { GoalInputDto, MatchResultDto, MatchStatus } from '../types';
import { RequestUser } from '../util/middleware';
import { createNextRoundMatchesIfReady } from './roundProgressionService';

// Admins can update any match; referees are limited to the match assigned to them.
function assertMatchAccess(actor: RequestUser, refereeUsername: string | null): void {
  if (actor.role === 'ADMIN') {
    return;
  }

  if (actor.role === 'REFEREE' && actor.username === refereeUsername) {
    return;
  }

  throw new ForbiddenError('Only the assigned referee or admin can update this match.');
}

async function loadMatch(matchId: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new NotFoundError('Match was not found.');
  }

  return match;
}

// A round stays locked until the previous round has been fully completed.
async function assertRoundUnlocked(match: { roundOrderNumber: number }) {
  if (match.roundOrderNumber <= 1) {
    return;
  }

  const previousRoundMatches = await prisma.match.findMany({
    where: { roundOrderNumber: match.roundOrderNumber - 1 },
    select: { status: true },
  });

  if (previousRoundMatches.length === 0 || previousRoundMatches.some((item) => item.status !== 'FINISHED')) {
    throw new ValidationError('Cannot edit this match until all matches in the previous round are FINISHED.');
  }
}

// Referees can only move a match forward through the status flow they control.
function assertStatusTransition(matchStatus: MatchStatus, nextStatus: MatchStatus, actor: RequestUser) {
  if (actor.role !== 'REFEREE') {
    return;
  }

  if (nextStatus !== 'IN_PROGRESS' && nextStatus !== 'FINISHED') {
    throw new ValidationError('Referees can only set a match to IN_PROGRESS or FINISHED.');
  }

  if (nextStatus === 'IN_PROGRESS' && matchStatus !== 'PLANNED' && matchStatus !== 'NOT_STARTED') {
    throw new ValidationError('Referees can only set IN_PROGRESS from PLANNED or NOT_STARTED.');
  }

  if (nextStatus === 'FINISHED' && matchStatus !== 'IN_PROGRESS') {
    throw new ValidationError('Referees can only set FINISHED from IN_PROGRESS.');
  }
}

// Goal input must always match the actual teams and an available player in this match.
async function validateGoalInput(matchId: number, goal: GoalInputDto) {
  const match = await loadMatch(matchId);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError('This match is not available yet. Teams are not assigned yet.');
  }

  const player = await prisma.player.findUnique({ where: { id: goal.playerId } });

  if (!player) {
    throw new NotFoundError('Scoring player was not found.');
  }

  if (player.teamName !== goal.teamName) {
    throw new ValidationError('Goal team must match the selected player team.');
  }

  if (goal.teamName !== match.homeTeamName && goal.teamName !== match.awayTeamName) {
    throw new ValidationError('Goal team must be one of the teams in the match.');
  }
}

// Recalculate the score from stored goals so the match summary stays the single source of truth.
async function recalculateMatchScores(matchId: number) {
  const match = await loadMatch(matchId);
  const goals = await prisma.goal.findMany({ where: { matchId } });

  const homeScore = goals.filter((goal) => goal.teamName === match.homeTeamName).length;
  const awayScore = goals.filter((goal) => goal.teamName === match.awayTeamName).length;

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore },
  });
}

export async function listMatches() {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } });
  return matches.map((match) => Match.from(match));
}

export async function getMatch(matchId: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      goals: {
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          team: {
            select: {
              name: true,
              countryFlag: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!match) {
    throw new NotFoundError('Match was not found.');
  }

  const baseMatch = Match.from(match);

  return {
    ...baseMatch,
    goals: match.goals.map((goal) => ({
      id: goal.id,
      playerId: goal.playerId,
      teamName: goal.teamName,
      playerName: `${goal.player.firstName} ${goal.player.lastName}`,
      teamCountryFlag: goal.team.countryFlag,
      createdAt: goal.createdAt,
    })),
  };
}

export async function updateMatchStatus(matchId: number, status: MatchStatus, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);
  await assertRoundUnlocked(match);
  assertStatusTransition(match.status as MatchStatus, status, actor);

  if ((status === 'NOT_STARTED' || status === 'IN_PROGRESS' || status === 'FINISHED') && (!match.homeTeamName || !match.awayTeamName)) {
    throw new ValidationError('This match is not available yet. Teams are not assigned yet.');
  }

  if (status === 'FINISHED') {
    if (match.homeScore === null || match.awayScore === null) {
      throw new ValidationError('Provide a valid score before finishing the match.');
    }

    if (match.homeScore === match.awayScore) {
      throw new ValidationError('Knockout matches cannot end in a draw.');
    }
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status },
  });

  if (status === 'FINISHED') {
    await createNextRoundMatchesIfReady(String(updated.roundOrderNumber));
  }

  return Match.from(updated);
}

export async function updateMatchResult(matchId: number, input: MatchResultDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);
  await assertRoundUnlocked(match);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError('This match is not available yet. Teams are not assigned yet.');
  }

  if (match.status !== 'IN_PROGRESS') {
    throw new ValidationError('Match must be IN_PROGRESS before entering results.');
  }

  if (input.goals && input.goals.length > 0) {
    await prisma.goal.deleteMany({ where: { matchId } });

    for (const goal of input.goals) {
      await validateGoalInput(matchId, goal);

      await prisma.goal.create({
        data: {
          matchId,
          playerId: goal.playerId,
          teamName: goal.teamName,
        },
      });
    }

    await recalculateMatchScores(matchId);
  } else if (typeof input.homeScore === 'number' && typeof input.awayScore === 'number') {
    if (input.homeScore < 0 || input.awayScore < 0) {
      throw new ValidationError('Scores must be non-negative.');
    }

    if (input.homeScore === input.awayScore) {
      throw new ValidationError('Knockout matches cannot end in a draw.');
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      },
    });
  } else {
    throw new ValidationError('Provide either goals or home and away scores.');
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: input.status ?? 'FINISHED',
    },
  });

  await createNextRoundMatchesIfReady(String(updated.roundOrderNumber));

  return Match.from(updated);
}

export async function addGoal(matchId: number, input: GoalInputDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);
  await assertRoundUnlocked(match);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError('This match is not available yet. Teams are not assigned yet.');
  }

  if (match.status !== 'IN_PROGRESS') {
    throw new ValidationError('Match must be IN_PROGRESS before adding goals.');
  }

  await validateGoalInput(matchId, input);

  const goal = await prisma.goal.create({
    data: {
      matchId,
      playerId: input.playerId,
      teamName: input.teamName,
    },
  });

  await recalculateMatchScores(matchId);

  return Goal.from(goal);
}

export async function updateGoal(matchId: number, goalId: number, input: GoalInputDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);
  await assertRoundUnlocked(match);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError('This match is not available yet. Teams are not assigned yet.');
  }

  if (match.status !== 'IN_PROGRESS') {
    throw new ValidationError('Match must be IN_PROGRESS before editing goals.');
  }

  const goal = await prisma.goal.findFirst({ where: { id: goalId, matchId } });

  if (!goal) {
    throw new NotFoundError('Goal was not found.');
  }

  await validateGoalInput(matchId, input);

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: input,
  });

  await recalculateMatchScores(matchId);

  return Goal.from(updated);
}

export async function getTopScorers() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: 'asc' } });
  const players = await prisma.player.findMany();

  const playerById = new Map(players.map((player) => [player.id, player]));
  const scorerMap = new Map<number, { playerId: number; playerName: string; teamName: string; teamCountryFlag: string; goals: number }>();

  for (const goal of goals) {
    const player = playerById.get(goal.playerId);

    if (!player) {
      continue;
    }

    const team = await prisma.team.findUnique({ where: { name: goal.teamName } });

    if (!team) {
      continue;
    }

    const existing = scorerMap.get(player.id) ?? {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamName: team.name,
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    existing.goals += 1;
    scorerMap.set(player.id, existing);
  }

  // Keep the leaderboard simple for students: most goals first.
  return Array.from(scorerMap.values()).sort((left, right) => right.goals - left.goals);
}
