import request from "./api";

export const getAdmins = () => request("/admin/all");

export const createAdmin = (payload) =>
  request("/admin/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdmin = (profileId, payload) =>
  request(`/admin/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateAdminPassword = (profileId, payload) =>
  request(`/admin/${profileId}/password`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });