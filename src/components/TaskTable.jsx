import React, { useEffect, useState } from 'react';
import TaskRow from './TaskRow';
import { fetchTasks } from '../lib/api';
import './task-table.css';

export default function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTasks()
      .then(data => { if (mounted) setTasks(data); })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function handleUpdate(updatedTask) {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  }

  return (
    <div>
      {loading ? <p>Loading tasks…</p> : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Progress</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
