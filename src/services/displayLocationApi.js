import request from "./api";

export function getDisplayLocations({ activeOnly = false } = {}) {
  const query = activeOnly ? "?activeOnly=true" : "";
  return request(`/display-locations${query}`);
}

export function createDisplayLocation(payload) {
  return request("/display-locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDisplayLocation(id, payload) {
  return request(`/display-locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDisplayLocation(id) {
  return request(`/display-locations/${id}`, {
    method: "DELETE",
  });
}