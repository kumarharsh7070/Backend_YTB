import api from "../api/axios";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

export const markAllRead = () => {
  return api.patch("/notifications/mark-read");
};
