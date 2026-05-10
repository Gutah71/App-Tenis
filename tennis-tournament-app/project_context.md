# Project Context

This project is a Tennis Tournament Management application built as a fullstack web app.

It is developed as a structured educational project and must remain simple and maintainable..

---

# Main Entities

User
Tournament
Registration
Match

---

# User

Represents a person using the system.

Roles:

ADMIN  
PLAYER

Admins manage tournaments.  
Players participate in tournaments.

---

# Tournament

Represents a tennis tournament.

Properties include:

- name
- description
- date
- location
- modality (singles/doubles)
- status
- maxParticipants
- prize
- rulesPdfUrl

---

# Registration

Represents a player joining a tournament.

Rules:

- A user can only register once per tournament.

Constraint:

(tournamentId, userId) must be unique.

---

# Match

Represents a single match in a tournament bracket.

Fields:

- round
- player1
- player2
- winner
- nextMatchId

Matches are linked to form the tournament bracket.

---

# Tournament Flow

1. Admin creates a tournament
2. Tournament opens for registration
3. Players register
4. When full, bracket is generated
5. Matches are played
6. Results are entered
7. Winners progress
8. Final match determines the champion