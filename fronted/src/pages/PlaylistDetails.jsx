import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  /* ================= FETCH CURRENT USER ================= */
  useEffect(() => {
    api
      .get("/users/current-user")
      .then((res) => setCurrentUser(res.data.data))
      .catch(() => setCurrentUser(null));
  }, []);

  /* ================= FETCH PLAYLIST ================= */
  useEffect(() => {
    api
      .get(`/playlists/${playlistId}`)
      .then((res) => setPlaylist(res.data.data))
      .catch(() => setPlaylist(null))
      .finally(() => setLoading(false));
  }, [playlistId]);

  /* ================= REMOVE VIDEO ================= */
  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm("Remove video from playlist?")) return;

    try {
      await api.patch(`/playlists/remove/${playlistId}/${videoId}`);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
    } catch {
      alert("Failed to remove video");
    }
  };

  /* ================= DELETE PLAYLIST ================= */
  const handleDeletePlaylist = async () => {
    if (!window.confirm("Delete this playlist permanently?")) return;

    try {
      await api.delete(`/playlists/${playlistId}`);
      alert("Playlist deleted successfully ✅");
      navigate(-1);
    } catch {
      alert("Failed to delete playlist ❌");
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

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Playlist not found
      </div>
    );
  }

  const isOwner = currentUser?._id === playlist.owner?._id;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="bg-gray-900 p-6 rounded-xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <p className="text-gray-400 mt-2">{playlist.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {playlist.videos.length} videos
            </p>
          </div>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div className="flex gap-3">
              <Link
                to={`/edit-playlist/${playlist._id}`}
                className="px-5 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Edit Playlist
              </Link>

              <button
                onClick={handleDeletePlaylist}
                className="px-5 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Delete Playlist
              </button>
            </div>
          )}
        </div>

        {/* ================= VIDEOS ================= */}
        {playlist.videos.length === 0 ? (
          <p className="text-gray-400">No videos in this playlist</p>
        ) : (
          <div className="space-y-4">
            {playlist.videos.map((video, index) => (
              <div
                key={video._id}
                className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition"
              >
                <span className="text-gray-400 w-6">{index + 1}</span>

                <Link to={`/watch/${video._id}`}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/watch/${video._id}`}
                    className="font-semibold hover:underline"
                  >
                    {video.title}
                  </Link>

                  <p className="text-sm text-gray-400">
                    {(video.views || 0).toLocaleString()} views •{" "}
                    {new Date(video.createdAt).toDateString()}
                  </p>
                </div>

                {/* REMOVE VIDEO (OWNER ONLY) */}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PlaylistDetails;
