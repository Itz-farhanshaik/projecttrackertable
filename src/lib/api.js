// Minimal API adapter — adjust endpoints/auth as needed.

export async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to load tasks');
  return res.json();
}

export async function updateTask(id, patch) {
  // Change to PUT if your server expects it
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed: ${res.status} ${text}`);
  }
  try { return await res.json(); } catch { return null; }
}
