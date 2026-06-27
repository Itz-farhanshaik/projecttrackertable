import React, { useState } from 'react';
import EditTaskModal from './EditTaskModal';
import './task-card.css';

export default function TaskCard({ task, stages = [], onTaskUpdated }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="task-card" role="group" aria-labelledby={`task-${task.id}-title`}>
      <div className="task-card-body">
        <h4 id={`task-${task.id}-title`}>{task.title}</h4>
        <p className="task-stage">{task.stage?.name ?? 'No stage'}</p>
        <div className="task-progress" aria-hidden>
          <div className="progress-bar" style={{ width: `${task.progress ?? 0}%` }} />
        </div>
      </div>

      {/* Edit button positioned bottom-right */}
      <button
        className="task-edit-btn"
        aria-label={`Edit ${task.title}`}
        onClick={() => setEditing(true)}
      >
        Edit
      </button>

      {editing && (
        <EditTaskModal
          task={task}
          stages={stages}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            onTaskUpdated && onTaskUpdated(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
