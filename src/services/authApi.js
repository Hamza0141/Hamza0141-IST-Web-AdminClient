import request from "./api";

export function loginAdmin(payload) {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentAdmin() {
  return request("/admin/me");
}

export function logoutAdmin() {
  return request("/admin/logout", {
    method: "POST",
  });
}