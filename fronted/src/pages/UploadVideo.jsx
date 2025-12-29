import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!videoFile || !thumbnail) {
      setError("Video file and thumbnail are required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ✅ EXACT backend keys
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      await api.post("/videos/publish", formData);

      setSuccess("Video uploaded successfully 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message || "Video upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="w-full max-w-lg bg-gray-900 p-8 rounded-xl shadow-2xl">

        <h2 className="text-2xl font-bold text-center mb-6">
          Upload Video 🎥
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {success && <p className="text-green-400 text-center mb-4">{success}</p>}

        <form onSubmit={handleUpload} className="space-y-4">

          <input
            type="text"
            placeholder="Video title"
            className="w-full px-4 py-3 rounded bg-gray-800 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Video description"
            className="w-full px-4 py-3 rounded bg-gray-800 outline-none resize-none"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            placeholder="Duration (seconds)"
            className="w-full px-4 py-3 rounded bg-gray-800 outline-none"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />

          <div>
            <label className="text-sm text-gray-400">Video file</label>
            <input
              type="file"
              accept="video/*"
              className="w-full mt-1"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Thumbnail image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full mt-1"
              onChange={(e) => setThumbnail(e.target.files[0])}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
