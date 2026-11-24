# APEX Firestore Security Specification

## 1. Data Invariants
1. **Role-Based Access Control (RBAC)**:
   - Athletes own their `/users/{userId}` workspace and subcollections (`customExercises`, `exerciseNotes`, `workouts`, `programs`, `activeSession`, `sessions`, `personalRecords`, `goals`, `measurements`, `macros`, `reminders`).
   - Coaches can read linked athletes' training records (`workouts`, `programs`, `sessions`, `personalRecords`, `goals`), post `coachFeedback` on completed sessions, send `coachAssignments`, and send `coach_feedback` / `program_change` / `team_announcement` / `checkin_reminder` alerts.
   - `gym_admin` privileges are strictly restricted to designated administrator accounts (`abdulhamidraghad093@gmail.com` or verified admin allowlist). Self-escalation to `gym_admin` is denied.
2. **PII Isolation**: User email is stored exclusively in `/users/{userId}/private/info` (strict owner-only read/write) and never leaked in `coachingLinks`, `coachMessages`, or `exerciseFlags`.
3. **Immutable History (Terminal State Locking)**: Completed workout logs in `/users/{userId}/sessions/{sessionId}` cannot have sets, weights, reps, duration, or volume modified after creation. Only authorized coaches adding `coachFeedback` or athletes stamping initial `coachId` on linkage are permitted.
4. **Query-Safe List Rules**: All `allow list` rules avoid `get()`/`exists()` lookups and enforce direct ownership (`userId == request.auth.uid` or `coachId == request.auth.uid` or `athleteUid == request.auth.uid`).
5. **Temporal Integrity & Bounded Payloads**: `createdAt` and `updatedAt` are validated against `request.time`; all IDs match `^[a-zA-Z0-9_\-]+$` (<= 128 chars); strings and lists are length-bounded.

## 2. Adversarial Protection Cases
1. Self-escalation by setting `role: "gym_admin"` on `/users/{uid}` -> `PERMISSION_DENIED`.
2. Unlinked coach reading `/users/{athleteUid}/sessions` -> `PERMISSION_DENIED`.
3. Coach attempting to alter athlete's logged sets/reps/weights on completed session -> `PERMISSION_DENIED`.
4. Any coach or admin reading `/users/{uid}/private/info` -> `PERMISSION_DENIED`.
5. Unverified email user writing any collection -> `PERMISSION_DENIED`.
6. Timestamp spoofing or ghost field injection -> `PERMISSION_DENIED`.
