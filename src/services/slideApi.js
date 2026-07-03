import request from "./api";

export function getSlides() {
  return request("/slides");
}

export function getSlideById(id) {
  return request(`/slides/${id}`);
}

export function createSlide(payload) {
  return request("/slides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSlide(id, payload) {
  return request(`/slides/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSlide(id) {
  return request(`/slides/${id}`, {
    method: "DELETE",
  });
}