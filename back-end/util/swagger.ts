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
    { name: 'Status', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication and user management' },
    { name: 'Competition', description: 'Tournament and round management' },
    { name: 'Players', description: 'View player information' },
    { name: 'Matches', description: 'Match and goal management' },
    { name: 'Users', description: 'Admin user management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login or register endpoints',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'string' } },
        example: { error: 'Invalid credentials' },
      },
      AuthUser: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'REFEREE', 'USER', 'GUEST'] },
        },
        example: {
          username: 'john_doe',
          role: 'USER',
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUser' },
          token: { type: 'string' },
        },
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', minLength: 3 },
          password: { type: 'string', minLength: 6 },
        },
        required: ['username', 'password'],
        example: { username: 'john_doe', password: 'password123' },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
        example: { username: 'john_doe', password: 'password123' },
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
        },
        example: { id: 'team1', name: 'Argentina', country: 'Argentina' },
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
        },
        example: {
          id: 'player1',
          teamId: 'team1',
          firstName: 'Lionel',
          lastName: 'Messi',
          shirtNumber: 10,
          position: 'Forward',
        },
      },

      Round: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          orderNumber: { type: 'integer' },
        },
        example: { id: 'round1', name: 'Group Stage', orderNumber: 1 },
      },
      Match: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          roundId: { type: 'string' },
          roundOrderNumber: { type: 'integer' },
          roundName: { type: 'string' },
          homeTeamId: { type: 'string' },
          awayTeamId: { type: 'string' },
          refereeId: { type: ['string', 'null'] },
          homeScore: { type: ['integer', 'null'] },
          awayScore: { type: ['integer', 'null'] },
          matchDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['PLANNED', 'NOT_STARTED', 'IN_PROGRESS', 'FINISHED'] },
        },
        example: {
          id: 'match1',
          roundId: 'round1',
          roundOrderNumber: 1,
          roundName: 'Group Stage',
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          refereeId: null,
          homeScore: null,
          awayScore: null,
          matchDate: '2026-06-21T18:00:00Z',
          status: 'PLANNED',
        },
      },
      UpdateMatchStatusRequest: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['PLANNED', 'NOT_STARTED', 'IN_PROGRESS', 'FINISHED'] },
        },
        required: ['status'],
        example: { status: 'IN_PROGRESS' },
      },
      UpdateMatchResultRequest: {
        type: 'object',
        properties: {
          homeScore: { type: 'integer' },
          awayScore: { type: 'integer' },
        },
        required: ['homeScore', 'awayScore'],
        example: { homeScore: 2, awayScore: 1 },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          matchId: { type: 'string' },
          playerId: { type: 'string' },
          teamId: { type: 'string' },
        },
        example: { id: 'goal1', matchId: 'match1', playerId: 'player1', teamId: 'team1' },
      },
      CreateGoalRequest: {
        type: 'object',
        properties: {
          playerId: { type: 'string' },
          teamId: { type: 'string' },
        },
        required: ['playerId', 'teamId'],
        example: { playerId: 'player1', teamId: 'team1' },
      },
      UpdateGoalRequest: {
        type: 'object',
        properties: {
          playerId: { type: 'string' },
          teamId: { type: 'string' },
        },
        example: { playerId: 'player1', teamId: 'team1' },
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
        example: {
          teamId: 'team1',
          teamName: 'Argentina',
          played: 3,
          won: 2,
          drawn: 1,
          lost: 0,
          goalsFor: 5,
          goalsAgainst: 2,
          goalDifference: 3,
          points: 7,
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
        example: {
          playerId: 'player1',
          playerName: 'Lionel Messi',
          teamId: 'team1',
          teamName: 'Argentina',
          goals: 3,
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
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'REFEREE', 'USER', 'GUEST'] },
          teamId: { type: ['string', 'null'] },
        },
        example: { id: '1', username: 'john_doe', role: 'USER', teamId: null },
      },
    },
  },
  paths: {
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Health check',
        description: 'Check if the backend server is running',
        responses: {
          200: {
            description: 'Backend is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                  example: { message: 'Back-end is running...' },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account with username and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User successfully registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Invalid request or username already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate user and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Invalid username or password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Retrieve authenticated user profile information',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthUser' },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/competition': {
      get: {
        tags: ['Competition'],
        summary: 'Get competition overview',
        description: 'Retrieve full competition details including teams, rounds, matches, standings, and top scorers',
        responses: {
          200: {
            description: 'Competition overview data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CompetitionOverview' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/competition/rounds': {
      get: {
        tags: ['Competition'],
        summary: 'List all rounds',
        description: 'Retrieve all tournament rounds',
        responses: {
          200: {
            description: 'List of rounds',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Round' },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/competition/rounds/{roundId}/simulate': {
      post: {
        tags: ['Competition'],
        summary: 'Simulate round results',
        description: 'Generate random results for all matches in a round (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roundId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the round to simulate',
          },
        ],
        responses: {
          200: {
            description: 'Round simulated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Match' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Round not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/competition/reset-matches': {
      post: {
        tags: ['Competition'],
        summary: 'Reset tournament matches',
        description: 'Reset all matches and goals to initial state (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Tournament reset successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                  example: { message: 'Tournament reset completed' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/players': {
      get: {
        tags: ['Players'],
        summary: 'List all players',
        description: 'Retrieve all players, optionally filtered by team',
        parameters: [
          {
            name: 'teamId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter players by team ID (optional)',
          },
        ],
        responses: {
          200: {
            description: 'List of players',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Player' },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/players/{playerId}': {
      get: {
        tags: ['Players'],
        summary: 'Get player by ID',
        description: 'Retrieve a specific player by ID',
        parameters: [
          {
            name: 'playerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the player',
          },
        ],
        responses: {
          200: {
            description: 'Player details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Player' },
              },
            },
          },
          404: {
            description: 'Player not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches': {
      get: {
        tags: ['Matches'],
        summary: 'List all matches',
        description: 'Retrieve all matches in the tournament',
        responses: {
          200: {
            description: 'List of matches',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Match' },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/top-scorers': {
      get: {
        tags: ['Matches'],
        summary: 'Get top scorers',
        description: 'Retrieve the list of top goal scorers in the tournament',
        responses: {
          200: {
            description: 'List of top scorers',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TopScorerRow' },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/{matchId}': {
      get: {
        tags: ['Matches'],
        summary: 'Get match by ID',
        description: 'Retrieve a specific match by ID',
        parameters: [
          {
            name: 'matchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the match',
          },
        ],
        responses: {
          200: {
            description: 'Match details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Match' },
              },
            },
          },
          404: {
            description: 'Match not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/{matchId}/status': {
      put: {
        tags: ['Matches'],
        summary: 'Update match status',
        description: 'Update the status of a match (Admin or Referee only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'matchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the match',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMatchStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Match status updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Match' },
              },
            },
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Match not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/{matchId}/result': {
      put: {
        tags: ['Matches'],
        summary: 'Update match result',
        description: 'Update the final score of a match (Admin or Referee only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'matchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the match',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMatchResultRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Match result updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Match' },
              },
            },
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Match not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/{matchId}/goals': {
      post: {
        tags: ['Matches'],
        summary: 'Add goal to match',
        description: 'Record a goal scored in a match (Admin or Referee only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'matchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the match',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateGoalRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Goal created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Goal' },
              },
            },
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Match not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/matches/{matchId}/goals/{goalId}': {
      put: {
        tags: ['Matches'],
        summary: 'Update goal',
        description: 'Update goal details (Admin or Referee only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'matchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the match',
          },
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the goal',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateGoalRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Goal updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Goal' },
              },
            },
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Match or goal not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description: 'Retrieve all users in the system (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/{userId}': {
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Remove a user from the system (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the user to delete',
          },
        ],
        responses: {
          204: {
            description: 'User deleted successfully',
          },
          401: {
            description: 'Unauthorized - invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden - insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};
