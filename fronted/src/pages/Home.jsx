import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import api from "../api/axios";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH CURRENT USER ================= */
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

  /* ================= FETCH VIDEOS ================= */
  const fetchVideos = async (query = "") => {
    setLoadingVideos(true);
    try {
      const res = await api.get("/videos", {
        params: query ? { query } : {},
      });
      setVideos(res.data?.data?.docs || []);
    } catch {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos(search.trim());
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen transition-colors bg-white text-black dark:bg-gray-950 dark:text-white">
      {/* NAVBAR */}
      <header className="flex flex-wrap gap-4 justify-between items-center px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <h1
          className="text-2xl font-bold text-red-600 cursor-pointer"
          onClick={() => {
            setSearch("");
            fetchVideos();
          }}
        >
          YouTubeClone
        </h1>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-l outline-none bg-gray-100 dark:bg-gray-800"
          />
          <button className="px-6 bg-red-600 text-white rounded-r">
            Search
          </button>
        </form>

        {!token ? (
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-red-600 text-white rounded">
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />

            {user && (
              <Link
                to={`/channel/${user.username}`}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <img src={user.avatar} className="w-8 h-8 rounded-full" />
                <span>{user.username}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* VIDEOS */}
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-6">
          {search ? `Results for "${search}"` : "Latest Videos 🎬"}
        </h2>

        {loadingVideos ? (
          <p className="text-gray-500">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-500">No videos found</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden transition hover:scale-105"
              >
                <Link to={`/watch/${video._id}`}>
                  <img src={video.thumbnail} className="w-full h-40 object-cover" />
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
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
