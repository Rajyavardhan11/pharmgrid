export const SESSION_KEY = 'pharmgrid.session.v1';

export function saveSession(storage, session) {
  storage.setItem(SESSION_KEY, JSON.stringify({ email: session.email, role: session.role, branchId: session.branch_id }));
}

export function readSession(storage) {
  try {
    const value = JSON.parse(storage.getItem(SESSION_KEY) || 'null');
    return value?.email && value?.role ? value : null;
  } catch {
    return null;
  }
}

export function clearSession(storage) {
  storage.removeItem(SESSION_KEY);
}
