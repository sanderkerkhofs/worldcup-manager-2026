import { MatchStatus } from '../types';

export function getMatchStatusLabel(status: MatchStatus | 'ACTIVE'): string {
  return status === 'ACTIVE' ? 'IN_PROGRESS' : status;
}
