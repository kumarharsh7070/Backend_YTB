import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // ================= FETCH CURRENT USER =================
  useEffect(() => {
    if (!token) return;

    api
      .get("/users/current-user")
      .then((res) => {
        setUser(res.data?.data || null);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, [token]);

  // ================= FETCH VIDEOS =================
  useEffect(() => {
    api
      .get("/videos")
      .then((res) => {
        if (Array.isArray(res.data?.data?.docs)) {
          setVideos(res.data.data.docs);
        } else {
          setVideos([]);
        }
      })
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));
  }, []);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ================= NAVBAR ================= */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-red-600">
          YouTubeClone
        </h1>

        {!token ? (
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 bg-gray-800 rounded">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-red-600 rounded">
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">

            {/* 👤 USER → CHANNEL PAGE */}
            {user && (
              <Link
                to={`/channel/${user.username}`}
                className="flex items-center gap-2 hover:bg-gray-800 px-3 py-1 rounded transition"
              >
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">
                  {user.username}
                </span>
              </Link>
            )}

            {/* Upload */}
          

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ================= VIDEOS ================= */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-6">
          Latest Videos 🎬
        </h2>

        {loadingVideos ? (
          <p className="text-gray-400">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-400">No videos uploaded yet</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition"
              >
                {/* Thumbnail */}
                <Link to={`/watch/${video._id}`}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                </Link>

                {/* Video info */}
                <div className="p-4">
                  <h3 className="font-semibold truncate">
                    {video.title}
                  </h3>

                  {/* Channel info */}
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={video.ownerDetails?.avatar}
                      alt="channel"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-400">
                      {video.ownerDetails?.username || "Unknown Channel"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {(video.views || 0).toLocaleString()} views •{" "}
                    {new Date(video.createdAt).toDateString()}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
