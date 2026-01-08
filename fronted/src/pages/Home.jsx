import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";

import api from "../api/axios";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // 🔍 SEARCH STATE
  const [search, setSearch] = useState("");

  // ================= FETCH CURRENT USER =================
  useEffect(() => {
    if (!token) return;

    api
      .get("/users/current-user")
      .then((res) => setUser(res.data?.data || null))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, [token]);

  // ================= FETCH VIDEOS =================
  const fetchVideos = (searchQuery = "") => {
    setLoadingVideos(true);

    api
      .get("/videos", {
        params: searchQuery ? { query: searchQuery } : {},
      })
      .then((res) => {
        setVideos(res.data?.data?.docs || []);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ================= SEARCH =================
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos(search);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ================= NAVBAR ================= */}
      <header className="flex flex-wrap gap-4 justify-between items-center px-8 py-4 border-b border-gray-800">

        <h1 className="text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => fetchVideos()}>
          YouTubeClone
        </h1>

        {/* 🔍 SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-l outline-none"
          />
          <button
            type="submit"
            className="px-6 bg-red-600 rounded-r hover:bg-red-700"
          >
            Search
          </button>
        </form>

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

  {/* 🔔 Notification Bell */}
  <NotificationBell />

  {/* 👤 User Profile */}
  {user && (
    <Link
      to={`/channel/${user.username}`}
      className="flex items-center gap-2 hover:bg-gray-800 px-3 py-1 rounded"
    >
      <img
        src={user.avatar}
        alt="avatar"
        className="w-8 h-8 rounded-full"
      />
      <span>{user.username}</span>
    </Link>
  )}

  {/* Logout */}
  <button
    onClick={handleLogout}
    className="px-4 py-2 bg-red-600 rounded"
  >
    Logout
  </button>
</div>
        )}
      </header>

      {/* ================= VIDEOS ================= */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-6">
          {search ? `Results for "${search}"` : "Latest Videos 🎬"}
        </h2>

        {loadingVideos ? (
          <p className="text-gray-400">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-400">No videos found</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition"
              >
                <Link to={`/watch/${video._id}`}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold truncate">
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={video.ownerDetails?.avatar}
                      className="w-6 h-6 rounded-full"
                      alt="channel"
                    />
                    <span className="text-sm text-gray-400">
                      {video.ownerDetails?.username}
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
