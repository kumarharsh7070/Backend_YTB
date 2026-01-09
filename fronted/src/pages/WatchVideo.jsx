import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/comment.service";
import { toggleVideoLike, toggleCommentLike } from "../services/like.service";
import api from "../api/axios";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= VIDEO ================= */
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= VIDEO LIKE ================= */
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  /* ================= USER ================= */
  const [user, setUser] = useState(null);

  /* ================= COMMENTS ================= */
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
      .then((res) => {
        setVideo(res.data.data);
        setLikesCount(res.data.data.likesCount || 0);
      })
      .catch(() => setError("Video not found"))
      .finally(() => setLoading(false));
  }, [videoId]);

  /* ================= FETCH VIDEO LIKE STATUS ================= */
  useEffect(() => {
    if (!video?._id || !token) return;

    api
      .get(`/likes/video-status/${video._id}`)
      .then((res) => setIsLiked(res.data.isLiked))
      .catch(() => {});
  }, [video, token]);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    getVideoComments(videoId)
      .then((res) => {
        setComments(Array.isArray(res?.data?.data) ? res.data.data : []);
      })
      .catch(() => setComments([]));
  }, [videoId]);

  useEffect(() => {
  if (!video?._id || !token) return;

  api.get(`/likes/video-status/${video._id}`)
    .then(res => {
      setLikesCount(res.data.totalLikes);
      setIsLiked(res.data.isLiked);
    })
    .catch(() => {});
}, [video, token]);

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!token) return navigate("/login");
    if (!newComment.trim()) return;

    try {
      const res = await addComment(videoId, newComment);

      setComments((prev) => [
        {
          ...res.data.data,
          isLiked: false,
          likesCount: 0,
        },
        ...prev,
      ]);

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
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editingText } : c
        )
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

  /* ================= VIDEO LIKE ================= */
  const handleVideoLike = async () => {
    if (!token) return navigate("/login");

    try {
      await toggleVideoLike(video._id);

      setIsLiked((prev) => !prev);
      setLikesCount((prev) =>
        isLiked ? Math.max(prev - 1, 0) : prev + 1
      );
    } catch {
      alert("Failed to like video");
    }
  };

  /* ================= COMMENT LIKE ================= */
  const handleCommentLike = async (commentId) => {
    if (!token) return navigate("/login");

    try {
      await toggleCommentLike(commentId);

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked
                  ? Math.max((c.likesCount || 1) - 1, 0)
                  : (c.likesCount || 0) + 1,
              }
            : c
        )
      );
    } catch {
      alert("Failed to like comment");
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

        <p className="text-gray-400 mb-4">
          {(video.views || 0).toLocaleString()} views •{" "}
          {new Date(video.createdAt).toDateString()}
        </p>

        {/* VIDEO LIKE */}
        <button
          onClick={handleVideoLike}
          className={`mb-6 px-4 py-2 rounded ${
            isLiked ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          👍 {likesCount}
        </button>

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

              <p className="text-gray-300 mt-2">{comment.content}</p>

              <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                {/* COMMENT LIKE */}
                <button
                  onClick={() => handleCommentLike(comment._id)}
                  className={comment.isLiked ? "text-blue-400" : ""}
                >
                  👍 {comment.likesCount || 0}
                </button>

                {user?._id === comment.user?._id && (
                  <>
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
                  </>
                )}
              </div>

              {editingCommentId === comment._id && (
                <div className="mt-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-gray-800 p-2 rounded"
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
