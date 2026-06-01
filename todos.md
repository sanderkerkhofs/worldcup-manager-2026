## Match lifecycle

- Match statuses: `PLANNED`, `NOT_STARTED`, `IN_PROGRESS`, `FINISHED`.
- Round completion is derived: all matches in round are `FINISHED` and next round advances automatically.
- Backend computes current round based on match statuses (no manual round state needed).
- Backend computes round completion by checking if all matches in a round have status `FINISHED`.

## Swagger Requirements

- Swagger available at /api-docs
- All routes documented and executable
- Controller-level component schemas are fully defined
- At least one complete route exists for each method: GET, POST, PUT, DELETE
