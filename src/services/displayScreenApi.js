import request from "./api";

export function getDisplayScreens({ activeOnly = false } = {}) {
  const query = activeOnly ? "?activeOnly=true" : "";
  return request(`/display-screens${query}`);
}

export function getDisplayScreenById(id) {
  return request(`/display-screens/${id}`);
}

export function createDisplayScreen(payload) {
  return request("/display-screens", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDisplayScreen(id, payload) {
  return request(`/display-screens/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDisplayScreen(id) {
  return request(`/display-screens/${id}`, {
    method: "DELETE",
  });
}