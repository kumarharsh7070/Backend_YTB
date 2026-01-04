import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const PlaylistsTab = ({ channelId, isOwnChannel }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER PLAYLISTS ================= */
  useEffect(() => {
    if (!channelId) return;

    api
      .get(`/playlists/user/${channelId}`)
      .then((res) => {
        setPlaylists(res.data?.data || []);
      })
      .catch(() => {
        setPlaylists([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [channelId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-gray-400 text-center">
        Loading playlists...
      </p>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (playlists.length === 0) {
    return (
      <div className="text-center text-gray-400">
        <p>No playlists created yet</p>

        {isOwnChannel && (
          <Link
            to="/create-playlist"
            className="inline-block mt-4 px-5 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Create your first playlist
          </Link>
        )}
      </div>
    );
  }

  /* ================= PLAYLIST GRID ================= */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <Link
          key={playlist._id}
          to={`/playlist/${playlist._id}`}
          className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition"
        >
          {/* Thumbnail */}
          <div className="relative h-40 bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">🎵</span>

            {/* Video count badge */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 text-xs rounded">
              {playlist.videos?.length || 0} videos
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold truncate">
              {playlist.name}
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Created on{" "}
              {new Date(playlist.createdAt).toDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PlaylistsTab;
