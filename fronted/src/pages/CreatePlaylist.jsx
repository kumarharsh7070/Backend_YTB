import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreatePlaylist = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= CREATE PLAYLIST ================= */
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      return setError("Playlist name is required");
    }

    setLoading(true);

    try {
      await api.post("/playlists", {
        name,
        description,
      });

      alert("Playlist created successfully ✅");
      navigate(-1); // go back to channel page
    } catch (err) {
      setError("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6">
          Create Playlist
        </h1>

        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}

        <form onSubmit={handleCreate} className="space-y-4">

          {/* Playlist Name */}
          <div>
            <label className="block text-sm mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-800 rounded"
              placeholder="My Favorite Videos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">
              Description (optional)
            </label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 bg-gray-800 rounded"
              placeholder="About this playlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              {loading ? "Creating..." : "Create"}
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

export default CreatePlaylist;
