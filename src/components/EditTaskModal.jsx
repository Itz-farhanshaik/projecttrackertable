import React, { useEffect, useState } from 'react';
import { updateTask } from '../lib/api';

/**
  Dynamic modal form:
  - Renders inputs for all keys of the `task` object except id.
  - Uses sensible input types for common fields (date, number for progress).
  - Calls updateTask(id, patch) and returns updated object via onSaved.
*/

export default function EditTaskModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial = { ...task };
    delete initial.id;
    setForm(initial);
  }, [task]);

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.title || !String(form.title).trim()) {
      alert('Title is required.');
      return;
    }

    setSaving(true);
    const original = { ...task };

    const optimistic = { ...original, ...form };
    try {
      onSaved(optimistic);
      const updated = await updateTask(task.id, form);
      onSaved(updated || optimistic);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes. Reverting.');
      onSaved(original);
    } finally {
      setSaving(false);
      onClose();
    }
  }

  function renderField(key, value) {
    const lower = key.toLowerCase();
    if (lower === 'id') return null;

    if (lower.includes('date') || lower === 'due' || lower === 'duedate' || /due/i.test(key)) {
      let dateVal = '';
      if (value) {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dateVal = `${yyyy}-${mm}-${dd}`;
        } else {
          dateVal = value;
        }
      }
      return (
        <input
          type="date"
          value={form[key] ?? dateVal}
          onChange={e => setField(key, e.target.value)}
        />
      );
    }

    if (lower.includes('progress') || lower === 'percent' || lower === 'completion') {
      const num = typeof value === 'number' ? value : (Number(value) || 0);
      return (
        <div className="progress-field">
          <input
            type="range"
            min="0"
            max="100"
            value={form[key] ?? num}
            onChange={e => setField(key, Number(e.target.value))}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={form[key] ?? num}
            onChange={e => setField(key, Number(e.target.value))}
            style={{ width: 60, marginLeft: 8 }}
          /> %
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={!!form[key]}
          onChange={e => setField(key, e.target.checked)}
        />
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={form[key] ?? value}
          onChange={e => setField(key, Number(e.target.value))}
        />
      );
    }

    if (typeof value === 'string' && value.length > 80) {
      return (
        <textarea value={form[key] ?? value} onChange={e => setField(key, e.target.value)} />
      );
    }

    return (
      <input
        type="text"
        value={form[key] ?? (value ?? '')}
        onChange={e => setField(key, e.target.value)}
      />
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Edit task</h3>
        <div className="modal-body">
          {Object.keys(form).map(key => (
            <label className="field-row" key={key}>
              <div className="field-label">{key}</div>
              <div className="field-input">{renderField(key, task[key])}</div>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn save" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn cancel" onClick={onClose} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
