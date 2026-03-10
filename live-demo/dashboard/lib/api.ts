/**
 * REST client for the AOMC control plane and rogue agent.
 *
 * The control plane (port 8000) and rogue agent (port 9000) are exposed
 * via Docker port mapping, so the browser can reach them directly on localhost.
 */

function getBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://aomc-control-plane:8000';
  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

function getRogueUrl(): string {
  if (typeof window === 'undefined') return 'http://agent-rogue-7749:9000';
  return `${window.location.protocol}//${window.location.hostname}:9000`;
}

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// --- Controls ---

export async function getControls(): Promise<Record<string, boolean>> {
  return fetchJSON(`${getBaseUrl()}/api/controls`);
}

export async function toggleControl(key: string): Promise<{ key: string; enabled: boolean }> {
  return fetchJSON(`${getBaseUrl()}/api/controls/toggle/${key}`, { method: 'POST' });
}

export async function setAllControls(enabled: boolean): Promise<Record<string, boolean>> {
  return fetchJSON(`${getBaseUrl()}/api/controls/all?enabled=${enabled}`, { method: 'POST' });
}

// --- Audit ---

export async function getAudit(): Promise<Array<Record<string, string>>> {
  return fetchJSON(`${getBaseUrl()}/api/audit`);
}

// --- Approvals ---

export async function getPendingApprovals(): Promise<Array<Record<string, string>>> {
  return fetchJSON(`${getBaseUrl()}/api/approvals/pending`);
}

export async function resolveApproval(id: string, action: 'approved' | 'denied'): Promise<void> {
  return fetchJSON(`${getBaseUrl()}/api/approvals/${id}/resolve?action=${action}`, { method: 'POST' });
}

// --- Rogue agent ---

export async function triggerRogue(): Promise<{ status: string }> {
  return fetchJSON(`${getRogueUrl()}/trigger`, { method: 'POST' });
}

export async function stopRogue(): Promise<{ status: string }> {
  return fetchJSON(`${getRogueUrl()}/stop`, { method: 'POST' });
}

export async function getRogueStatus(): Promise<{ running: boolean }> {
  return fetchJSON(`${getRogueUrl()}/status`);
}

// --- Reset ---

export async function resetState(): Promise<void> {
  return fetchJSON(`${getBaseUrl()}/api/reset`, { method: 'POST' });
}

// --- Vendors ---

export async function getVendors(): Promise<Record<string, { name: string; control: string; url: string }>> {
  return fetchJSON(`${getBaseUrl()}/api/vendors`);
}

// --- Agents ---

export async function getAgents(): Promise<Array<Record<string, unknown>>> {
  return fetchJSON(`${getBaseUrl()}/api/agents`);
}
