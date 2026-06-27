---
name: Add edit option on task card (stage & progress)
about: Adds UI and server route to edit task stage and progress from the task card modal.
---

### Summary

This PR adds an "Edit" button to the task card (bottom-right). Clicking it opens a modal allowing the user to change the task's stage and update progress (0–100). The modal saves via PATCH /api/tasks/:id and updates the UI.

### Included changes
- Frontend
  - src/components/TaskCard.jsx — task card with Edit button
  - src/components/EditTaskModal.jsx — modal for editing stage & progress
  - src/components/task-card.css — styles
  - src/components/edit-task-modal.css — modal styles
- Backend
  - server/routes/tasks.js — example PATCH /api/tasks/:id route

### Dev notes
- Ensure tasks table has `stage_id` (FK) and `progress` (integer).
- Add server-side auth/permissions before merging.

### Manual QA
1. Run app, open task card, click Edit.
2. Change stage and progress, click Save.
3. Confirm UI and DB update.
