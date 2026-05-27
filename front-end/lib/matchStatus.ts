import { MatchStatus } from '../types';
import { LocaleCode } from './i18n';

const statusTranslations: Record<LocaleCode, Record<string, string>> = {
  nl: {
    PLANNED: 'Gepland',
    NOT_STARTED: 'Niet gestart',
    IN_PROGRESS: 'Bezig',
    FINISHED: 'Afgelopen',
    COMPLETED: 'Voltooid',
    ACTIVE: 'Actief',
  },
  en: {
    PLANNED: 'Planned',
    NOT_STARTED: 'Not started',
    IN_PROGRESS: 'In progress',
    FINISHED: 'Finished',
    COMPLETED: 'Completed',
    ACTIVE: 'Active',
  },
  fr: {
    PLANNED: 'Planifie',
    NOT_STARTED: 'Pas commence',
    IN_PROGRESS: 'En cours',
    FINISHED: 'Termine',
    COMPLETED: 'Complete',
    ACTIVE: 'Actif',
  },
};

export function getMatchStatusLabel(status: MatchStatus, locale: LocaleCode = 'en'): string {
  return statusTranslations[locale][status] ?? status;
}
