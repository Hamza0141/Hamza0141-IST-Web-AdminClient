import request from "./api";

export const getSlides = () => request("/slides");

export const createSlide = (payload) =>
  request("/slides/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateSlide = (id, payload) =>
  request(`/slides/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteSlide = (id) =>
  request(`/slides/${id}`, {
    method: "DELETE",
  });