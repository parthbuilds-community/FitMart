const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function patchBugStatus(id, newStatus, token) {
  const res = await fetch(`${API}/api/bugs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new Error(`update failed (${res.status}): ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return res.json();
}