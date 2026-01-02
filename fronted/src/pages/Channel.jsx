import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const Channel = () => {
  const { username } = useParams();
  const token = localStorage.getItem("token");

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  /* ================= FETCH CURRENT USER ================= */
  useEffect(() => {
    if (!token) return;

    api
      .get("/users/current-user")
      .then((res) => setCurrentUser(res.data.data))
      .catch(() => setCurrentUser(null));
  }, [token]);

  /* ================= FETCH CHANNEL PROFILE ================= */
  useEffect(() => {
    api
      .get(`/users/channel/${username}`)
      .then((res) => {
        setChannel(res.data.data);
        setIsSubscribed(res.data.data.isSubscribed);
        setSubscribersCount(res.data.data.subscribersCount);
      })
      .catch(() => setChannel(null))
      .finally(() => setLoading(false));
  }, [username]);

  /* ================= FETCH CHANNEL VIDEOS ================= */
  useEffect(() => {
    if (!channel?._id) return;

    api
      .get(`/videos/channel/${channel._id}`)
      .then((res) => setVideos(res.data.data))
      .catch(() => setVideos([]));
  }, [channel]);

  /* ================= SUBSCRIBE / UNSUBSCRIBE ================= */
  const handleSubscribe = async () => {
    if (!token) {
      alert("Please login to subscribe");
      return;
    }

    setSubLoading(true);
    try {
      await api.post(`/subscriptions/${channel._id}`);
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) =>
        isSubscribed ? prev - 1 : prev + 1
      );
    } catch {
      alert("Failed to update subscription");
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading channel...
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Channel not found
      </div>
    );
  }

  const isOwnChannel = currentUser?._id === channel._id;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ================= BANNER ================= */}
      <div className="h-48 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600"></div>

      {/* ================= CHANNEL HEADER ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="bg-gray-900 p-6 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">

          {/* Left */}
          <div className="flex items-center gap-6">
            <img
              src={channel.avatar}
              alt="channel"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-900"
            />

            <div>
              <h1 className="text-3xl font-bold">
                {channel.username}
              </h1>

              <p className="text-gray-400 mt-1 flex items-center gap-1">
                👤 {subscribersCount.toLocaleString()} subscribers
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {isOwnChannel ? (
              <>
                <Link
                  to="/upload"
                  className="px-5 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Upload Video
                </Link>

                <Link
                  to="/change-password"
                  className="px-5 py-2 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Update Password
                </Link>
                <Link
                  to="/edit-profile"
                  className="px-5 py-2 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Edit Profile
                </Link>
              </>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`px-6 py-2 rounded font-semibold transition ${
                  isSubscribed
                    ? "bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {subLoading
                  ? "Please wait..."
                  : isSubscribed
                  ? "Subscribed"
                  : "Subscribe"}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ================= VIDEOS SECTION ================= */}
      <div className="max-w-6xl mx-auto p-8">

        <h2 className="text-xl font-semibold mb-6">
          Videos
        </h2>

        {videos.length === 0 ? (
          <p className="text-gray-400">
            No videos uploaded yet
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/watch/${video._id}`}
                className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold truncate">
                    {video.title}
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    {(video.views || 0).toLocaleString()} views •{" "}
                    {new Date(video.createdAt).toDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
