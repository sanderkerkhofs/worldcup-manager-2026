# Project Schema - worldcup-manager-2026

This document centralizes the analysis data model in one place:

- all entities
- key relationships
- UML class diagram
- conceptual ERD
- logical ERD

## 1. Entities

### Team

- team_id (PK)
- name
- country
- coach

### Match

- match_id (PK)
- round_order_number
- round_name
- home_team_id (FK -> Team)
- away_team_id (FK -> Team)
- referee_id (FK -> User, optional in this analysis model)
- home_score
- away_score
- match_date
- status

### Player

- player_id (PK)
- team_id (FK -> Team)
- first_name
- last_name
- shirt_number
- position
- status (available | unavailable)

### Goal

- goal_id (PK)
- match_id (FK -> Match)
- player_id (FK -> Player)
- team_id (FK -> Team)
- minute

## 2. Relationship Overview

- Team 1 -> N Player
- Match 1 -> N Goal
- Player 1 -> N Goal
- Team 1 -> N Goal
- Match N -> 1 Team (home_team_id)
- Match N -> 1 Team (away_team_id)

Business rule highlights:

- each team has at least 15 players
- player status is fixed to available/unavailable
- referee can only select available players when registering goal scorers
- stage progression uses Match.round_order_number ordering (no separate Round table)

## 3. UML Class Diagram

```mermaid
classDiagram
  class Team {
    +int team_id
    +string name
    +string country
    +string coach
  }

  class Match {
    +int match_id
    +int round_order_number
    +string round_name
    +int home_team_id
    +int away_team_id
    +int referee_id
    +int home_score
    +int away_score
    +datetime match_date
    +string status
  }

  class Player {
    +int player_id
    +int team_id
    +string first_name
    +string last_name
    +int shirt_number
    +string position
    +PlayerStatus status
    +setStatus(status)
  }

  class Goal {
    +int goal_id
    +int match_id
    +int player_id
    +int team_id
    +int minute
  }

  Team "1" --> "*" Player
  Match "1" --> "*" Goal
  Player "1" --> "*" Goal
  Team "1" --> "*" Goal
```

## 4. Conceptual ERD

```mermaid
erDiagram
  TEAM ||--o{ PLAYER : has
  MATCH ||--o{ GOAL : records
  PLAYER ||--o{ GOAL : scores
  TEAM ||--o{ GOAL : for_team
  TEAM ||--o{ MATCH : home_or_away
```

## 5. Logical ERD

```mermaid
erDiagram
  TEAM {
    INT team_id PK
    VARCHAR name
    VARCHAR country
    VARCHAR coach
  }

  MATCH {
    INT match_id PK
    INT round_order_number
    VARCHAR round_name
    INT home_team_id FK
    INT away_team_id FK
    INT referee_id FK
    INT home_score
    INT away_score
    DATETIME match_date
    VARCHAR status
  }

  PLAYER {
    INT player_id PK
    INT team_id FK
    VARCHAR first_name
    VARCHAR last_name
    INT shirt_number
    VARCHAR position
    ENUM status
  }

  GOAL {
    INT goal_id PK
    INT match_id FK
    INT player_id FK
    INT team_id FK
    INT minute
  }

  TEAM ||--o{ PLAYER : has
  MATCH ||--o{ GOAL : has
  PLAYER ||--o{ GOAL : scores
  TEAM ||--o{ GOAL : for_team
  TEAM ||--o{ MATCH : home_or_away
```

## 6. Scope Note

This schema is intentionally modeled as a single fixed competition (World Cup 2026). Competition metadata (name/year/host/format) is provided through app configuration (for example .env or JSON), not a database entity.
