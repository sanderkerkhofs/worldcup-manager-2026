# Project Schema - worldcup-manager-2026

This document centralizes the analysis data model in one place, derived directly from `back-end/repository/prisma/schema.prisma`.

- all entities and enums
- key relationships
- UML class diagram
- conceptual ERD
- logical ERD

## 1. Enums

### UserRole

```
ADMIN | REFEREE | USER | GUEST
```

### MatchStatus

```
PLANNED | NOT_STARTED | IN_PROGRESS | FINISHED
```

## 2. Entities

### User

- id: String (CUID, PK)
- username: String (UNIQUE)
- passwordHash: String
- role: UserRole (default: GUEST)
- teamId: String? (FK → Team, optional)
- createdAt: DateTime
- updatedAt: DateTime

### Team

- id: String (CUID, PK)
- name: String (UNIQUE)
- country: String
- countryShortName: String
- countryFlag: String
- createdAt: DateTime
- updatedAt: DateTime

### Match

- id: String (CUID, PK)
- roundOrderNumber: Int
- roundName: String
- homeTeamId: String? (FK → Team, optional)
- awayTeamId: String? (FK → Team, optional)
- refereeId: String? (FK → User, optional)
- homeScore: Int?
- awayScore: Int?
- matchDate: DateTime
- status: MatchStatus (default: PLANNED)
- createdAt: DateTime
- updatedAt: DateTime

### Player

- id: String (CUID, PK)
- teamId: String (FK → Team)
- firstName: String
- lastName: String
- shirtNumber: Int
- position: String
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE constraint: (teamId, shirtNumber)

### Goal

- id: String (CUID, PK)
- matchId: String (FK → Match)
- playerId: String (FK → Player)
- teamId: String (FK → Team)
- createdAt: DateTime

## 3. Relationship Overview

- Team 1 → N Player
- Team 1 → N Goal (scoring team)
- Team 1 → N Match (as homeTeam or awayTeam)
- Match 1 → N Goal
- Player 1 → N Goal
- User (referee) 0..1 → N Match (assignedMatches)
- User 0..1 → N Team membership (teamId, optional)

Business rule highlights:

- Each team has at least 15 seeded players
- Stage progression uses `Match.roundOrderNumber` ordering (no separate Round/Stage entity)
- Matches are pre-created at database seed time with `PLANNED` status
- Teams are assigned to matches during seeding (first stage) or during simulation (subsequent stages)
- No `minute` field on Goal — goals are recorded without timestamps; only `createdAt` is present
- `Goal.teamId` must match a team that is playing in the match
- `Goal.playerId` must belong to `Goal.teamId`

## 4. UML Class Diagram

See [drawio/uml-class-diagram.drawio](drawio/uml-class-diagram.drawio) for the editable diagram.

```mermaid
classDiagram
  class UserRole {
    <<enumeration>>
    ADMIN
    REFEREE
    USER
    GUEST
  }

  class MatchStatus {
    <<enumeration>>
    PLANNED
    NOT_STARTED
    IN_PROGRESS
    FINISHED
  }

  class User {
    +String id
    +String username
    +String passwordHash
    +UserRole role
    +String? teamId
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Team {
    +String id
    +String name
    +String country
    +String countryShortName
    +String countryFlag
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Match {
    +String id
    +Int roundOrderNumber
    +String roundName
    +String? homeTeamId
    +String? awayTeamId
    +String? refereeId
    +Int? homeScore
    +Int? awayScore
    +DateTime matchDate
    +MatchStatus status
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Player {
    +String id
    +String teamId
    +String firstName
    +String lastName
    +Int shirtNumber
    +String position
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Goal {
    +String id
    +String matchId
    +String playerId
    +String teamId
    +DateTime createdAt
  }

  Team "1" --> "*" Player : has
  Team "1" --> "*" Goal : for_team
  Team "1" --> "*" Match : home_or_away
  Match "1" --> "*" Goal : records
  Player "1" --> "*" Goal : scores
  User "0..1" --> "*" Match : referees
  User "*" --> "0..1" Team : member_of

  User --> UserRole
  Match --> MatchStatus
```

## 5. Conceptual ERD

See [drawio/erd-conceptual.drawio](drawio/erd-conceptual.drawio) for the editable diagram (Chen notation with entities, attributes, and relationship diamonds).

```mermaid
erDiagram
  USER {
    string id PK
    string username
    string role
  }
  TEAM {
    string id PK
    string name
    string country
    string countryFlag
  }
  PLAYER {
    string id PK
    string firstName
    string lastName
    int shirtNumber
    string position
  }
  MATCH {
    string id PK
    int roundOrderNumber
    string roundName
    datetime matchDate
    string status
  }
  GOAL {
    string id PK
    datetime createdAt
  }

  TEAM ||--o{ PLAYER : "has"
  TEAM }o--o{ MATCH : "plays in"
  USER }o--o| MATCH : "referees"
  MATCH ||--o{ GOAL : "records"
  PLAYER ||--o{ GOAL : "scores"
  TEAM ||--o{ GOAL : "for team"
```

### Cardinality notes

| Relationship | From   | Cardinality | To     | Cardinality |
| ------------ | ------ | ----------- | ------ | ----------- |
| has          | TEAM   | (1, M)      | PLAYER | (1, 1)      |
| plays in     | TEAM   | (0, N)      | MATCH  | (1, M)      |
| referees     | USER   | (0, N)      | MATCH  | (0, 1)      |
| records      | MATCH  | (1, M)      | GOAL   | (1, 1)      |
| scores       | PLAYER | (0, N)      | GOAL   | (1, 1)      |
| for team     | TEAM   | (0, N)      | GOAL   | (1, 1)      |

## 6. Logical ERD

See [drawio/erd-logical.drawio](drawio/erd-logical.drawio) for the editable diagram.

```mermaid
erDiagram
  USER {
    String id PK
    String username
    String passwordHash
    UserRole role
    String teamId FK
    DateTime createdAt
    DateTime updatedAt
  }

  TEAM {
    String id PK
    String name
    String country
    String countryShortName
    String countryFlag
    DateTime createdAt
    DateTime updatedAt
  }

  MATCH {
    String id PK
    Int roundOrderNumber
    String roundName
    String homeTeamId FK
    String awayTeamId FK
    String refereeId FK
    Int homeScore
    Int awayScore
    DateTime matchDate
    MatchStatus status
    DateTime createdAt
    DateTime updatedAt
  }

  PLAYER {
    String id PK
    String teamId FK
    String firstName
    String lastName
    Int shirtNumber
    String position
    DateTime createdAt
    DateTime updatedAt
  }

  GOAL {
    String id PK
    String matchId FK
    String playerId FK
    String teamId FK
    DateTime createdAt
  }

  USER ||--o{ MATCH : referees
  TEAM ||--o{ PLAYER : has
  TEAM ||--o{ GOAL : "for team"
  TEAM ||--o{ MATCH : "home or away"
  MATCH ||--o{ GOAL : records
  PLAYER ||--o{ GOAL : scores
```

## 7. Scope Note

This schema is intentionally modeled as a single fixed competition (World Cup 2026). Competition metadata (name/year/host/format) is provided through app configuration (`.env` or seed constants), not as a database entity.

The `Goal` model does not include a `minute` field — goals are recorded without a match-minute timestamp. Only `createdAt` is available. This is a deliberate design choice to keep the model simple for school delivery.
