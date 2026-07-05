import React, { useState } from 'react';
import EditTaskModal from './EditTaskModal';

export default function TaskRow({ task, onUpdate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr>
        <td>{task.title}</td>
        <td>{typeof task.progress === 'number' ? `${task.progress}%` : (task.progress ?? '')}</td>
        <td>{task.due ?? ''}</td>
        <td>
          <button className="btn edit" onClick={() => setOpen(true)}>Edit</button>
        </td>
      </tr>

      {open && (
        <EditTaskModal
          task={task}
          onClose={() => setOpen(false)}
          onSaved={(updated) => { onUpdate(updated); setOpen(false); }}
        />
      )}
    </>
  );
}
