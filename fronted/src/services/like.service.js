// src/services/like.service.js
import api from "../api/axios";


export const toggleVideoLike = (videoId) => {
  return api.post(`/likes/${videoId}`);
};


export const toggleCommentLike = (commentId) => {
  return api.post(`/likes/comment/${commentId}`);
};


export const getLikedVideos = () => {
  return api.get("/likes/videos");
};




