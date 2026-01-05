import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/comment.service";
import api from "../api/axios";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= STATES ================= */
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  /* ================= FETCH CURRENT USER ================= */
  useEffect(() => {
    if (!token) return;
    api
      .get("/users/current-user")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  }, [token]);

  /* ================= FETCH VIDEO ================= */
  useEffect(() => {
    api
      .get(`/videos/${videoId}`)
      .then((res) => setVideo(res.data.data))
      .catch(() => setError("Video not found"))
      .finally(() => setLoading(false));
  }, [videoId]);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    getVideoComments(videoId)
      .then((res) => {
        setComments(Array.isArray(res?.data?.data) ? res.data.data : []);
      })
      .catch(() => setComments([]));
  }, [videoId]);

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!token) return navigate("/login");
    if (!newComment.trim()) return;

    try {
      const res = await addComment(videoId, newComment);
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment("");
    } catch {
      alert("Failed to add comment");
    }
  };

  /* ================= UPDATE COMMENT ================= */
  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      const res = await updateComment(commentId, editingText);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );
      setEditingCommentId(null);
      setEditingText("");
    } catch {
      alert("Failed to update comment");
    }
  };

  /* ================= DELETE COMMENT ================= */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      alert("Failed to delete comment");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading video...
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* VIDEO */}
        <video
          src={video.videoFile}
          controls
          className="w-full max-h-[500px] bg-black rounded mb-4"
        />

        <h1 className="text-2xl font-bold">{video.title}</h1>

        <p className="text-gray-400 mb-6">
          {(video.views || 0).toLocaleString()} views •{" "}
          {new Date(video.createdAt).toDateString()}
        </p>

        {/* COMMENTS */}
        <h2 className="text-lg font-semibold mb-4">
          {comments.length} Comments
        </h2>

        <textarea
          disabled={!token}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded"
          placeholder={token ? "Add a comment..." : "Login to comment"}
        />

        <button
          onClick={handleAddComment}
          className="mt-2 px-4 py-2 bg-blue-600 rounded"
        >
          Comment
        </button>

        <div className="space-y-4 mt-6">
          {comments.filter(Boolean).map((comment) => (
            <div key={comment._id} className="bg-gray-900 p-4 rounded">

              <div className="flex items-center gap-3">
                <img
                  src={comment.user?.avatar || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full"
                  alt="user"
                />
                <span className="font-semibold">
                  {comment.user?.username || "Unknown User"}
                </span>
              </div>

              {editingCommentId === comment._id ? (
                <>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-gray-800 p-2 rounded mt-2"
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => handleUpdateComment(comment._id)}
                      className="text-blue-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-300 mt-2">{comment.content}</p>
              )}

              {user?._id === comment.user?._id && (
                <div className="flex gap-4 mt-2 text-sm">
                  <button
                    onClick={() => {
                      setEditingCommentId(comment._id);
                      setEditingText(comment.content);
                    }}
                    className="text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default WatchVideo;
