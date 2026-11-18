const REQUESTS_KEY = "equiplink.requests.v1";

export function getRequests() {
  try {
    const stored = window.localStorage.getItem(REQUESTS_KEY);
    if (!stored) return [];
    const requests = JSON.parse(stored);
    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    console.error("Could not read saved EquipLink requests.", error);
    return [];
  }
}

export function createRequest(fields) {
  const request = {
    ...fields,
    id: `EL-${Date.now().toString().slice(-7)}`,
    status: "Pending Review",
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify([request, ...getRequests()]));
  window.dispatchEvent(new Event("equiplink:requests-changed"));
  return request;
}

export function updateRequest(id, changes) {
  const requests = getRequests();
  const found = requests.some((request) => request.id === id);
  if (!found) throw new Error(`Request ${id} was not found.`);
  const updated = requests.map((request) =>
    request.id === id
      ? { ...request, ...changes, updatedAt: new Date().toISOString() }
      : request,
  );
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("equiplink:requests-changed"));
  return updated.find((request) => request.id === id);
}
