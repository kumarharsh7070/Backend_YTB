import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditPlaylist = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH PLAYLIST ================= */
  useEffect(() => {
    api
      .get(`/playlists/${playlistId}`)
      .then((res) => {
        const playlist = res.data.data;
        setName(playlist.name);
        setDescription(playlist.description || "");
      })
      .catch(() => {
        setError("Failed to load playlist");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playlistId]);

  /* ================= UPDATE PLAYLIST ================= */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.patch(`/playlists/${playlistId}`, {
        name,
        description,
      });

      alert("Playlist updated successfully ✅");
      navigate(-1);
    } catch {
      setError("Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading playlist...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6">
          Edit Playlist
        </h1>

        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}

        <form onSubmit={handleSave} className="space-y-4">

          {/* Playlist Name */}
          <div>
            <label className="block text-sm mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {saving ? "Saving..." : "Save Changes"}
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

export default EditPlaylist;
