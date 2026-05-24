import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Locale } from '@types';
import { loadLocale, saveLocale } from './session';

type TranslationKey =
    | 'app.title'
    | 'app.subtitle'
    | 'nav.home'
    | 'nav.tournaments'
    | 'nav.login'
    | 'nav.logout'
    | 'home.hero'
    | 'home.copy'
    | 'home.testUsers'
    | 'home.loginHint'
    | 'home.statusHint'
    | 'auth.title'
    | 'auth.login'
    | 'auth.register'
    | 'auth.username'
    | 'auth.password'
    | 'auth.role'
    | 'auth.submitLogin'
    | 'auth.submitRegister'
    | 'auth.errorRequired'
    | 'tournaments.title'
    | 'tournaments.create'
    | 'tournaments.delete'
    | 'tournaments.empty'
    | 'tournaments.overview'
    | 'tournaments.rounds'
    | 'tournaments.matches'
    | 'tournaments.teams'
    | 'tournaments.standings'
    | 'tournaments.addTeam'
    | 'tournaments.removeTeam'
    | 'common.loading'
    | 'common.language';

const translations: Record<Locale, Record<TranslationKey, string>> = {
    en: {
        'app.title': 'Tournament Manager',
        'app.subtitle': 'A learning-first MVP for football tournament administration.',
        'nav.home': 'Home',
        'nav.tournaments': 'Tournaments',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'home.hero': 'Build a tournament, register teams, schedule matches, and follow standings.',
        'home.copy': 'This MVP is intentionally simple, documented, and easy to extend.',
        'home.testUsers': 'Lecturer test users',
        'home.loginHint': 'Use the login page to start a session and unlock the dashboard.',
        'home.statusHint': 'Backend and API docs are available once the server is running.',
        'auth.title': 'Authentication',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.role': 'Role',
        'auth.submitLogin': 'Sign in',
        'auth.submitRegister': 'Create account',
        'auth.errorRequired': 'All required fields must be filled in.',
        'tournaments.title': 'Tournament dashboard',
        'tournaments.create': 'Create tournament',
        'tournaments.delete': 'Delete',
        'tournaments.empty': 'No tournaments yet. Create the first one below.',
        'tournaments.overview': 'Overview',
        'tournaments.rounds': 'Rounds',
        'tournaments.matches': 'Matches',
        'tournaments.teams': 'Teams',
        'tournaments.standings': 'Standings',
        'tournaments.addTeam': 'Register team',
        'tournaments.removeTeam': 'Remove team',
        'common.loading': 'Loading...',
        'common.language': 'Language',
    },
    nl: {
        'app.title': 'Toernooi Manager',
        'app.subtitle': 'Een leergerichte MVP voor voetbaltoernooien.',
        'nav.home': 'Start',
        'nav.tournaments': 'Toernooien',
        'nav.login': 'Aanmelden',
        'nav.logout': 'Afmelden',
        'home.hero': 'Maak een toernooi, registreer teams, plan wedstrijden en volg de stand.',
        'home.copy': 'Deze MVP is bewust eenvoudig, gedocumenteerd en makkelijk uit te breiden.',
        'home.testUsers': 'Testgebruikers voor de lector',
        'home.loginHint': 'Gebruik de loginpagina om een sessie te starten en het dashboard te openen.',
        'home.statusHint': 'Backend en API-documentatie zijn beschikbaar zodra de server draait.',
        'auth.title': 'Authenticatie',
        'auth.login': 'Inloggen',
        'auth.register': 'Registreren',
        'auth.username': 'Gebruikersnaam',
        'auth.password': 'Wachtwoord',
        'auth.role': 'Rol',
        'auth.submitLogin': 'Meld aan',
        'auth.submitRegister': 'Account maken',
        'auth.errorRequired': 'Alle verplichte velden moeten ingevuld zijn.',
        'tournaments.title': 'Toernooidashboard',
        'tournaments.create': 'Toernooi maken',
        'tournaments.delete': 'Verwijderen',
        'tournaments.empty': 'Nog geen toernooien. Maak hieronder de eerste aan.',
        'tournaments.overview': 'Overzicht',
        'tournaments.rounds': 'Rondes',
        'tournaments.matches': 'Wedstrijden',
        'tournaments.teams': 'Teams',
        'tournaments.standings': 'Stand',
        'tournaments.addTeam': 'Team registreren',
        'tournaments.removeTeam': 'Team verwijderen',
        'common.loading': 'Laden...',
        'common.language': 'Taal',
    },
};

type LocaleContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    translate: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        const storedLocale = loadLocale();
        if (storedLocale === 'en' || storedLocale === 'nl') {
            setLocaleState(storedLocale);
        }
    }, []);

    const setLocale = (nextLocale: Locale) => {
        setLocaleState(nextLocale);
        saveLocale(nextLocale);
    };

    const translate = (key: TranslationKey) => translations[locale][key] ?? key;

    const value = useMemo(() => ({ locale, setLocale, translate }), [locale]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used inside a LocaleProvider.');
    }

    return context;
}

export function useT() {
    return useLocale().translate;
}