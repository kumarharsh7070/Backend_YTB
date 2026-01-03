import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  // ================= STATE =================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH VIDEO =================
  useEffect(() => {
    api
      .get(`/videos/${videoId}`)
      .then((res) => {
        const video = res.data.data;
        setTitle(video.title);
        setDescription(video.description);
        setDuration(video.duration || "");
        setIsPublished(video.isPublished);
      })
      .catch(() => setError("Failed to load video"))
      .finally(() => setLoading(false));
  }, [videoId]);

  // ================= UPDATE VIDEO =================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      if (duration) formData.append("duration", duration);

      // IMPORTANT: backend expects boolean-like value
      formData.append("isPublished", isPublished ? "true" : "false");

      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (videoFile) formData.append("videoFile", videoFile);

      await api.put(`/videos/${videoId}`, formData);

      alert("Video updated successfully ✅");
      navigate(-1); // back to channel
    } catch (err) {
      setError("Failed to update video ❌");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE VIDEO =================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/videos/${videoId}`);
      alert("Video deleted successfully 🗑️");
      navigate(-1);
    } catch {
      alert("Failed to delete video ❌");
    }
  };

  // ================= UI STATES =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading video...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6">Edit Video</h1>

        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-800 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-800 rounded"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-gray-800 rounded"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={() => setIsPublished((prev) => !prev)}
            />
            <span>
              {isPublished ? "Published" : "Unpublished"}
            </span>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm mb-1">
              Replace Thumbnail (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
          </div>

          {/* Video File */}
          <div>
            <label className="block text-sm mb-1">
              Replace Video (optional)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {saving ? "Saving..." : "Update Video"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Delete Video
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditVideo;
