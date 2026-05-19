import request from "./api";

export const getAnnouncements = () => request("/announcements");

export const createAnnouncement = (payload) =>
  request("/announcements/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAnnouncement = (id, payload) =>
  request(`/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAnnouncement = (id) =>
  request(`/announcements/${id}`, {
    method: "DELETE",
  });