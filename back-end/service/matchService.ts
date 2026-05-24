import { prisma } from '../repository/prisma/client';
import { ForbiddenError, NotFoundError, ValidationError } from '../util/errors';
import { Match } from '../model/match';
import { Goal } from '../model/goal';
import { GoalInputDto, MatchResultDto, MatchStatus } from '../types';
import { RequestUser } from '../util/middleware';
import { createNextRoundMatchesIfReady } from './roundProgressionService';

function assertMatchAccess(actor: RequestUser, refereeId: string | null): void {
  if (actor.role === 'ADMIN') {
    return;
  }

  if (actor.role === 'REFEREE' && actor.id === refereeId) {
    return;
  }

  throw new ForbiddenError('Only the assigned referee or admin can update this match.');
}

async function loadMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new NotFoundError('Match was not found.');
  }

  return match;
}

async function validateGoalInput(matchId: string, goal: GoalInputDto) {
  const match = await loadMatch(matchId);

  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError('This match is not available yet. Initiate the round first.');
  }

  const player = await prisma.player.findUnique({ where: { id: goal.playerId } });

  if (!player) {
    throw new NotFoundError('Scoring player was not found.');
  }

  if (player.teamId !== goal.teamId) {
    throw new ValidationError('Goal team must match the selected player team.');
  }

  if (player.status !== 'AVAILABLE') {
    throw new ValidationError('Only available players can be used as goal scorers.');
  }

  if (goal.teamId !== match.homeTeamId && goal.teamId !== match.awayTeamId) {
    throw new ValidationError('Goal team must be one of the teams in the match.');
  }
}

async function recalculateMatchScores(matchId: string) {
  const match = await loadMatch(matchId);
  const goals = await prisma.goal.findMany({ where: { matchId } });

  const homeScore = goals.filter((goal) => goal.teamId === match.homeTeamId).length;
  const awayScore = goals.filter((goal) => goal.teamId === match.awayTeamId).length;

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore },
  });
}

export async function listMatches() {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } });
  return matches.map((match) => Match.from(match));
}

export async function getMatch(matchId: string) {
  const match = await loadMatch(matchId);
  return Match.from(match);
}

export async function updateMatchStatus(matchId: string, status: MatchStatus, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);

  if ((status === 'IN_PROGRESS' || status === 'COMPLETED') && (!match.homeTeamId || !match.awayTeamId)) {
    throw new ValidationError('This match is not available yet. Initiate the round first.');
  }

  if (status === 'COMPLETED') {
    if (match.homeScore === null || match.awayScore === null) {
      throw new ValidationError('Provide a valid score before completing the match.');
    }

    if (match.homeScore === match.awayScore) {
      throw new ValidationError('Knockout matches cannot end in a draw.');
    }
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status },
  });

  return Match.from(updated);
}

export async function updateMatchResult(matchId: string, input: MatchResultDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);

  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError('This match is not available yet. Initiate the round first.');
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
          teamId: goal.teamId,
          minute: goal.minute,
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
      status: input.status ?? 'COMPLETED',
    },
  });

  await createNextRoundMatchesIfReady(updated.roundId);

  return Match.from(updated);
}

export async function addGoal(matchId: string, input: GoalInputDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);

  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError('This match is not available yet. Initiate the round first.');
  }

  if (match.status !== 'IN_PROGRESS') {
    throw new ValidationError('Match must be IN_PROGRESS before adding goals.');
  }

  await validateGoalInput(matchId, input);

  const goal = await prisma.goal.create({
    data: {
      matchId,
      playerId: input.playerId,
      teamId: input.teamId,
      minute: input.minute,
    },
  });

  await recalculateMatchScores(matchId);

  return Goal.from(goal);
}

export async function updateGoal(matchId: string, goalId: string, input: GoalInputDto, actor: RequestUser) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);

  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError('This match is not available yet. Initiate the round first.');
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
  const teams = await prisma.team.findMany();

  const scorerMap = new Map<string, { playerId: string; playerName: string; teamId: string; teamName: string; goals: number }>();

  for (const goal of goals) {
    const player = players.find((candidate) => candidate.id === goal.playerId);
    const team = teams.find((candidate) => candidate.id === goal.teamId);

    if (!player || !team) {
      continue;
    }

    const existing = scorerMap.get(player.id) ?? {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamId: team.id,
      teamName: team.name,
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    existing.goals += 1;
    scorerMap.set(player.id, existing);
  }

  return Array.from(scorerMap.values()).sort((left, right) => right.goals - left.goals);
}
