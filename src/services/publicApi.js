import request from "./api";

export const getPublicPrayers = () => request("/public/prayers");