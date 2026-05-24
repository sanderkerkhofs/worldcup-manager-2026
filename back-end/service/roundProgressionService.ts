import { prisma } from '../repository/prisma/client';
import { ValidationError } from '../util/errors';

export async function createNextRoundMatchesIfReady(roundId: string) {
  const completedRound = await prisma.round.findUnique({
    where: { id: roundId },
    include: { matches: { orderBy: { matchDate: 'asc' } } },
  });

  if (!completedRound || completedRound.matches.length === 0) {
    return;
  }

  const allMatchesCompleted = completedRound.matches.every((match) => (
    match.status === 'COMPLETED' && typeof match.homeScore === 'number' && typeof match.awayScore === 'number'
  ));

  if (!allMatchesCompleted) {
    return;
  }

  const nextRound = await prisma.round.findUnique({
    where: { orderNumber: completedRound.orderNumber + 1 },
    include: { matches: { orderBy: { matchDate: 'asc' } } },
  });

  if (!nextRound || nextRound.matches.length === 0) {
    return;
  }

  const winners = completedRound.matches.map((match) => {
    if (!match.homeTeamId || !match.awayTeamId) {
      throw new ValidationError('Completed knockout matches must have both teams assigned.');
    }

    if (match.homeScore === null || match.awayScore === null) {
      throw new ValidationError('Completed knockout matches must contain scores.');
    }

    const homeScore = match.homeScore;
    const awayScore = match.awayScore;

    if (homeScore === awayScore) {
      throw new ValidationError('Knockout matches cannot end in a draw.');
    }

    return homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
  });

  if (winners.length % 2 !== 0) {
    throw new ValidationError('Winner count must be even to build the next round.');
  }

  if (nextRound.matches.length !== winners.length / 2) {
    throw new ValidationError('Next round does not have the expected number of pre-seeded matches.');
  }

  const hasAllTeamsAssigned = nextRound.matches.every((match) => match.homeTeamId && match.awayTeamId);

  if (hasAllTeamsAssigned) {
    return;
  }

  await prisma.$transaction(async (transaction) => {
    for (let index = 0; index < nextRound.matches.length; index += 1) {
      const homeTeamId = winners[index * 2];
      const awayTeamId = winners[index * 2 + 1];

      await transaction.goal.deleteMany({ where: { matchId: nextRound.matches[index].id } });

      await transaction.match.update({
        where: { id: nextRound.matches[index].id },
        data: {
          homeTeamId,
          awayTeamId,
          homeScore: null,
          awayScore: null,
          status: 'NOT_STARTED',
        },
      });
    }
  });
}
