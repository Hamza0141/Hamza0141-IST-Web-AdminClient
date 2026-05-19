import request from "./api";

export const getDisplayScreens = () => request("/display-screens");

export const createDisplayScreen = (payload) =>
  request("/display-screens/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDisplayScreen = (id, payload) =>
  request(`/display-screens/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteDisplayScreen = (id) =>
  request(`/display-screens/${id}`, {
    method: "DELETE",
  });