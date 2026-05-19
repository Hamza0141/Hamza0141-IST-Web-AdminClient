import request from "./api";

export function getPrayers() {
  return request("/prayers");
}

export function updatePrayer(id, payload) {
  return request(`/prayers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}