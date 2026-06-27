import React, { useState } from 'react';
import './edit-task-modal.css';

export default function EditTaskModal({ task, stages = [], onClose, onSaved }) {
  const [stageId, setStageId] = useState(task.stage_id ?? task.stage?.id ?? '');
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e && e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: stageId, progress }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      onSaved && onSaved(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to save task — check console.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit task">
      <div className="modal">
        <header>
          <h3>Edit task</h3>
        </header>

        <form onSubmit={handleSave}>
          <div className="form-row">
            <label htmlFor="stage-select">Stage</label>
            <select
              id="stage-select"
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              required
            >
              <option value="">Select stage</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="progress-range">Progress: {progress}%</label>
            <input
              id="progress-range"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
