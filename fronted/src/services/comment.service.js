import api from "../api/axios";

/* GET ALL COMMENTS OF A VIDEO */
export const getVideoComments = (videoId) => {
  return api.get(`/comments/${videoId}`);
};

/* ADD NEW COMMENT */
export const addComment = (videoId, content) => {
  return api.post(`/comments/${videoId}`, { content });
};

/* UPDATE COMMENT */
export const updateComment = (commentId, content) => {
  return api.patch(`/comments/${commentId}`, { content });
};

/* DELETE COMMENT */
export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};
