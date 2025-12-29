import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Home = () => {
  const navigate = useNavigate();

  // 🔐 Check login status FIRST
  const token = localStorage.getItem("token");

  // 👤 Logged-in user state
  const [user, setUser] = useState(null);

  // 📡 Fetch current user
  useEffect(() => {
    if (token) {
      api
        .get("/users/current-user")
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          // invalid token → logout
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, [token]);

  // 🚪 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ================= NAVBAR ================= */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-red-600">
          YouTubeClone
        </h1>

        {/* Right side */}
        {!token ? (
          // ❌ Guest user
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Register
            </Link>
          </div>
        ) : (
          // ✅ Logged-in user
          <div className="flex items-center gap-4">

            {/* Avatar + Username */}
            {user && (
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">
                  {user.username}
                </span>
              </div>
            )}

            <Link
              to="/upload"
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Upload Video
            </Link>

            <Link
              to="/change-password"
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              Update Password
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="p-8">

        {/* Welcome Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to YouTubeClone 🎬
          </h2>
          <p className="text-gray-400">
            Watch videos, upload content, like, comment and share.
          </p>
        </section>

        {/* Video Grid (Placeholder) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition"
            >
              <div className="h-40 bg-gray-800 flex items-center justify-center text-gray-500">
                Video Thumbnail
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">
                  Sample Video Title
                </h3>
                <p className="text-sm text-gray-400">
                  Channel Name • 10K views
                </p>
              </div>
            </div>
          ))}

        </section>

      </main>
    </div>
  );
};

export default Home;
