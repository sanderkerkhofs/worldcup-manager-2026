export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Tournament Manager API',
        version: '1.0.0',
        description: 'MVP API for the school project tournament manager.',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
    tags: [
        { name: 'Status' },
        { name: 'Auth' },
        { name: 'Tournaments' },
        { name: 'Teams' },
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
                properties: {
                    error: { type: 'string' },
                },
            },
            AuthUser: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'ORGANIZER', 'VIEWER'] },
                },
                required: ['id', 'username', 'role'],
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    user: { $ref: '#/components/schemas/AuthUser' },
                    token: { type: 'string' },
                },
                required: ['user', 'token'],
            },
            Tournament: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    year: { type: 'integer' },
                    format: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Team: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    country: { type: 'string' },
                    coach: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Round: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    tournamentId: { type: 'string' },
                    name: { type: 'string' },
                    orderNumber: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Match: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    tournamentId: { type: 'string' },
                    roundId: { type: 'string' },
                    homeTeamId: { type: 'string' },
                    awayTeamId: { type: 'string' },
                    homeScore: { type: ['integer', 'null'] },
                    awayScore: { type: ['integer', 'null'] },
                    matchDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
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
            Overview: {
                type: 'object',
                properties: {
                    tournament: { $ref: '#/components/schemas/Tournament' },
                    teams: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Team' },
                    },
                    rounds: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Round' },
                    },
                    matches: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Match' },
                    },
                    standings: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StandingRow' },
                    },
                },
            },
        },
    },
    paths: {
        '/status': {
            get: {
                tags: ['Status'],
                summary: 'Health check',
                responses: {
                    200: {
                        description: 'Backend is running',
                    },
                },
            },
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' },
                                    role: { type: 'string', enum: ['ADMIN', 'ORGANIZER', 'VIEWER'] },
                                },
                                required: ['username', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User registered',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                },
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
                responses: {
                    200: {
                        description: 'Login succeeded',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Read the active user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Current user',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthUser' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tournaments': {
            get: {
                tags: ['Tournaments'],
                summary: 'List tournaments',
                responses: {
                    200: {
                        description: 'Tournament list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Tournament' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tournaments'],
                summary: 'Create a tournament',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    year: { type: 'integer' },
                                    format: { type: 'string' },
                                },
                                required: ['name', 'year', 'format'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Tournament created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Tournament' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tournaments/{id}': {
            get: {
                tags: ['Tournaments'],
                summary: 'Get one tournament',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Tournament',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Tournament' },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['Tournaments'],
                summary: 'Update a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    year: { type: 'integer' },
                                    format: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Tournament updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Tournament' },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Tournaments'],
                summary: 'Delete a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Tournament deleted' },
                },
            },
        },
        '/api/tournaments/{id}/overview': {
            get: {
                tags: ['Tournaments'],
                summary: 'Read tournament overview',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Tournament overview',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Overview' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tournaments/{id}/teams': {
            get: {
                tags: ['Tournaments'],
                summary: 'List teams for a tournament',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Registered teams',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Team' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tournaments'],
                summary: 'Register a team in a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    teamId: { type: 'string' },
                                },
                                required: ['teamId'],
                            },
                        },
                    },
                },
                responses: {
                    204: { description: 'Team registered' },
                },
            },
        },
        '/api/tournaments/{id}/teams/{teamId}': {
            delete: {
                tags: ['Tournaments'],
                summary: 'Remove a team from a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'teamId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    204: { description: 'Team removed' },
                },
            },
        },
        '/api/tournaments/{id}/rounds': {
            get: {
                tags: ['Tournaments'],
                summary: 'List rounds for a tournament',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Rounds list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Round' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tournaments'],
                summary: 'Create a round for a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    orderNumber: { type: 'integer' },
                                },
                                required: ['name', 'orderNumber'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Round created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Round' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tournaments/{id}/matches': {
            get: {
                tags: ['Tournaments'],
                summary: 'List matches for a tournament',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Matches list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Match' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tournaments'],
                summary: 'Create a match for a tournament',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    roundId: { type: 'string' },
                                    homeTeamId: { type: 'string' },
                                    awayTeamId: { type: 'string' },
                                    matchDate: { type: 'string', format: 'date-time' },
                                },
                                required: ['roundId', 'homeTeamId', 'awayTeamId', 'matchDate'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Match created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Match' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tournaments/{id}/standings': {
            get: {
                tags: ['Tournaments'],
                summary: 'Get tournament standings',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Standings',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/StandingRow' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/teams': {
            get: {
                tags: ['Teams'],
                summary: 'List teams',
                responses: {
                    200: {
                        description: 'Teams list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Team' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Teams'],
                summary: 'Create a team',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    country: { type: 'string' },
                                    coach: { type: 'string' },
                                },
                                required: ['name', 'country', 'coach'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Team created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Team' },
                            },
                        },
                    },
                },
            },
        },
        '/api/teams/{id}': {
            delete: {
                tags: ['Teams'],
                summary: 'Delete a team',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Team deleted' },
                },
            },
        },
        '/api/matches/{id}/result': {
            put: {
                tags: ['Matches'],
                summary: 'Update match result',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    homeScore: { type: 'integer' },
                                    awayScore: { type: 'integer' },
                                    status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED'] },
                                },
                                required: ['homeScore', 'awayScore'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Match updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Match' },
                            },
                        },
                    },
                },
            },
        },
    },
};