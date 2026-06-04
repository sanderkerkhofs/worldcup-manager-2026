import { prisma } from '../repository/prisma/client';
import { ValidationError } from '../util/errors';

/**
 * Round identifiers are stored by order number, with an optional "round-" prefix.
 */
function parseRoundIdentifier(roundId: string): number {
  const parsed = Number.parseInt(roundId.replace(/^round-/i, ''), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError('Round identifier is invalid.');
  }

  return parsed;
}

export async function createNextRoundMatchesIfReady(roundId: string) {
  const completedRoundOrderNumber = parseRoundIdentifier(roundId);
  const completedRoundMatches = await prisma.match.findMany({
    where: { roundOrderNumber: completedRoundOrderNumber },
    orderBy: { matchDate: 'asc' },
  });

  if (completedRoundMatches.length === 0) {
    return;
  }

  // Only advance the bracket once every match in the current round has been scored and closed.
  const allMatchesCompleted = completedRoundMatches.every((match) => (
    match.status === 'FINISHED'
      && typeof match.homeScore === 'number'
      && typeof match.awayScore === 'number'
  ));

  if (!allMatchesCompleted) {
    return;
  }

  const nextRoundMatches = await prisma.match.findMany({
    where: { roundOrderNumber: completedRoundOrderNumber + 1 },
    orderBy: { matchDate: 'asc' },
  });

  if (nextRoundMatches.length === 0) {
    // No next round exists - this round is the final round, so just leave matches as FINISHED
    return;
  }

  const winners = completedRoundMatches.map((match) => {
    if (!match.homeTeamName || !match.awayTeamName) {
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

    return homeScore > awayScore ? match.homeTeamName : match.awayTeamName;
  });

  if (winners.length % 2 !== 0) {
    throw new ValidationError('Winner count must be even to build the next round.');
  }

  if (nextRoundMatches.length !== winners.length / 2) {
    throw new ValidationError('Next round does not have the expected number of pre-seeded matches.');
  }

  const hasAllTeamsAssigned = nextRoundMatches.every((match) => match.homeTeamName && match.awayTeamName);

  if (hasAllTeamsAssigned) {
    // All teams already assigned - no need to update current round
    return;
  }

  // The transaction keeps both rounds consistent if one next-round assignment fails.
  await prisma.$transaction(async (transaction) => {
    for (let index = 0; index < nextRoundMatches.length; index += 1) {
      const homeTeamName = winners[index * 2];
      const awayTeamName = winners[index * 2 + 1];

      await transaction.goal.deleteMany({ where: { matchId: nextRoundMatches[index].id } });

      await transaction.match.update({
        where: { id: nextRoundMatches[index].id },
        data: {
          homeTeamName,
          awayTeamName,
          homeScore: null,
          awayScore: null,
          status: 'NOT_STARTED',
        },
      });
    }
  });
}
