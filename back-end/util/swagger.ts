import { competition } from './competition';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'worldcup-manager-2026 API',
    version: '1.0.0',
    description: 'Express API for the fixed World Cup 2026 competition.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Status' },
    { name: 'Auth' },
    { name: 'Competition' },
    { name: 'Teams' },
    { name: 'Players' },
    { name: 'Matches' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'COACH', 'REFEREE', 'GUEST'] },
          teamId: { type: ['string', 'null'] },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUser' },
          token: { type: 'string' },
        },
      },
      Competition: {
        type: 'object',
        properties: {
          name: { type: 'string', example: competition.name },
          year: { type: 'integer', example: competition.year },
          hostCountry: { type: 'string', example: competition.hostCountry },
          format: { type: 'string', example: competition.format },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          country: { type: 'string' },
          coach: { type: 'string' },
        },
      },
      Player: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          teamId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          shirtNumber: { type: 'integer' },
          position: { type: 'string' },
          status: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE'] },
        },
      },
      Round: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          orderNumber: { type: 'integer' },
        },
      },
      Match: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          roundId: { type: 'string' },
          homeTeamId: { type: 'string' },
          awayTeamId: { type: 'string' },
          refereeId: { type: ['string', 'null'] },
          homeScore: { type: ['integer', 'null'] },
          awayScore: { type: ['integer', 'null'] },
          matchDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['NOT_STARTED', 'ACTIVE', 'COMPLETED'] },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          matchId: { type: 'string' },
          playerId: { type: 'string' },
          teamId: { type: 'string' },
          minute: { type: 'integer' },
        },
      },
      StandingRow: {
        type: 'object',
        properties: {
          teamId: { type: 'string' },
          teamName: { type: 'string' },
          played: { type: 'integer' },
          won: { type: 'integer' },
          drawn: { type: 'integer' },
          lost: { type: 'integer' },
          goalsFor: { type: 'integer' },
          goalsAgainst: { type: 'integer' },
          goalDifference: { type: 'integer' },
          points: { type: 'integer' },
        },
      },
      TopScorerRow: {
        type: 'object',
        properties: {
          playerId: { type: 'string' },
          playerName: { type: 'string' },
          teamId: { type: 'string' },
          teamName: { type: 'string' },
          goals: { type: 'integer' },
        },
      },
      CompetitionOverview: {
        type: 'object',
        properties: {
          competition: { $ref: '#/components/schemas/Competition' },
          teams: { type: 'array', items: { $ref: '#/components/schemas/Team' } },
          rounds: { type: 'array', items: { $ref: '#/components/schemas/Round' } },
          matches: { type: 'array', items: { $ref: '#/components/schemas/Match' } },
          standings: { type: 'array', items: { $ref: '#/components/schemas/StandingRow' } },
          topScorers: { type: 'array', items: { $ref: '#/components/schemas/TopScorerRow' } },
        },
      },
    },
  },
  paths: {
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Health check',
        responses: { 200: { description: 'Backend is running' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a guest user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['username', 'password'],
              },
            },
          },
        },
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['username', 'password'],
              },
            },
          },
        },
        responses: { 200: { description: 'Login succeeded' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user' } },
      },
    },
    '/api/competition': {
      get: {
        tags: ['Competition'],
        summary: 'Get the fixed competition overview',
        responses: { 200: { description: 'Competition overview' } },
      },
    },
    '/api/competition/rounds/{roundId}/initiate': {
      post: {
        tags: ['Competition'],
        summary: 'Initiate a round',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roundId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Round initiated' } },
      },
    },
    '/api/competition/rounds/{roundId}/simulate': {
      post: {
        tags: ['Competition'],
        summary: 'Simulate a round result set',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roundId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Round simulated' } },
      },
    },
    '/api/teams': {
      get: { tags: ['Teams'], summary: 'List teams', responses: { 200: { description: 'Teams list' } } },
    },
    '/api/players': {
      get: { tags: ['Players'], summary: 'List players', responses: { 200: { description: 'Players list' } } },
    },
    '/api/matches': {
      get: { tags: ['Matches'], summary: 'List matches', responses: { 200: { description: 'Matches list' } } },
    },
  },
};
