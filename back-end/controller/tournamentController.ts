import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { successResponse } from '../util/response';
import {
    addTeamToTournament,
    createMatchForTournament,
    createRoundForTournament,
    createTournamentUseCase,
    deleteTournamentUseCase,
    getAllTournaments,
    getTournament,
    getTournamentMatches,
    getTournamentOverview,
    getTournamentRounds,
    getTournamentStandings,
    getTournamentTeams,
    removeTeamFromTournament,
    updateTournamentUseCase,
} from '../service/tournamentService';

export const tournamentRouter = Router();

tournamentRouter.get('/', asyncHandler(async (_req, res) => {
    const tournaments = await getAllTournaments();
    res.json(successResponse(tournaments, 'Tournaments loaded successfully.'));
}));

tournamentRouter.post('/', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    const tournament = await createTournamentUseCase(req.body);
    res.status(201).json(successResponse(tournament, 'Tournament created successfully.'));
}));

tournamentRouter.get('/:id', asyncHandler(async (req, res) => {
    const tournament = await getTournament(req.params.id);
    res.json(successResponse(tournament, 'Tournament loaded successfully.'));
}));

tournamentRouter.put('/:id', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    const tournament = await updateTournamentUseCase(req.params.id, req.body);
    res.json(successResponse(tournament, 'Tournament updated successfully.'));
}));

tournamentRouter.delete('/:id', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    await deleteTournamentUseCase(req.params.id);
    res.status(204).send();
}));

tournamentRouter.get('/:id/overview', asyncHandler(async (req, res) => {
    const overview = await getTournamentOverview(req.params.id);
    res.json(successResponse(overview, 'Tournament overview loaded successfully.'));
}));

tournamentRouter.get('/:id/teams', asyncHandler(async (req, res) => {
    const teams = await getTournamentTeams(req.params.id);
    res.json(successResponse(teams, 'Tournament teams loaded successfully.'));
}));

tournamentRouter.post('/:id/teams', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    await addTeamToTournament(req.params.id, req.body.teamId);
    res.status(204).send();
}));

tournamentRouter.delete('/:id/teams/:teamId', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    await removeTeamFromTournament(req.params.id, req.params.teamId);
    res.status(204).send();
}));

tournamentRouter.get('/:id/rounds', asyncHandler(async (req, res) => {
    const rounds = await getTournamentRounds(req.params.id);
    res.json(successResponse(rounds, 'Tournament rounds loaded successfully.'));
}));

tournamentRouter.post('/:id/rounds', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    const round = await createRoundForTournament({
        tournamentId: req.params.id,
        name: req.body.name,
        orderNumber: req.body.orderNumber,
    });
    res.status(201).json(successResponse(round, 'Round created successfully.'));
}));

tournamentRouter.get('/:id/matches', asyncHandler(async (req, res) => {
    const matches = await getTournamentMatches(req.params.id);
    res.json(successResponse(matches, 'Tournament matches loaded successfully.'));
}));

tournamentRouter.post('/:id/matches', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    const match = await createMatchForTournament({
        tournamentId: req.params.id,
        roundId: req.body.roundId,
        homeTeamId: req.body.homeTeamId,
        awayTeamId: req.body.awayTeamId,
        matchDate: req.body.matchDate,
    });
    res.status(201).json(successResponse(match, 'Match created successfully.'));
}));

tournamentRouter.get('/:id/standings', asyncHandler(async (req, res) => {
    const standings = await getTournamentStandings(req.params.id);
    res.json(successResponse(standings, 'Standings loaded successfully.'));
}));