import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [video, setVideo] = useState(null);
  const [user, setUser] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH CURRENT USER ================= */
  useEffect(() => {
    if (!token) return;

    api
      .get("/users/current-user")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  }, [token]);

  /* ================= FETCH VIDEO ================= */
  useEffect(() => {
    api
      .get(`/videos/${videoId}`)
      .then((res) => setVideo(res.data.data))
      .catch(() => setError("Video not found"))
      .finally(() => setLoading(false));
  }, [videoId]);

  /* ================= FETCH SUBSCRIBER COUNT ================= */
  useEffect(() => {
    if (!video?.owner?._id) return;

    api
      .get(`/subscriptions/subscribers/${video.owner._id}`)
      .then((res) => {
        setSubscribersCount(res.data.totalSubscribers || 0);
      })
      .catch(() => setSubscribersCount(0));
  }, [video]);

  /* ================= CHECK IF USER IS SUBSCRIBED ================= */
  useEffect(() => {
    if (!user?._id || !video?.owner?._id) return;

    api
      .get(`/subscriptions/subscribed/${user._id}`)
      .then((res) => {
        const channels = res.data.subscribedChannels || [];
        const subscribed = channels.some(
          (ch) => ch._id === video.owner._id
        );
        setIsSubscribed(subscribed);
      })
      .catch(() => setIsSubscribed(false));
  }, [user, video]);

  /* ================= SUBSCRIBE / UNSUBSCRIBE ================= */
  const handleSubscribe = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setSubLoading(true);

    try {
      await api.post(`/subscriptions/${video.owner._id}`);

      // instant UI update
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) =>
        isSubscribed ? Math.max(prev - 1, 0) : prev + 1
      );
    } catch {
      alert("Failed to update subscription");
    } finally {
      setSubLoading(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading video...
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error || "Video not found"}
      </div>
    );
  }

  const isOwnChannel = user?._id === video?.owner?._id;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* 🎬 VIDEO PLAYER */}
        <div className="rounded-lg overflow-hidden mb-6">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="w-full max-h-[500px] bg-black"
          />
        </div>

        {/* 📝 VIDEO DETAILS */}
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

        <p className="text-gray-400 mb-4">
          {(video.views || 0).toLocaleString()} views •{" "}
          {new Date(video.createdAt).toDateString()}
        </p>

        {/* 👤 CHANNEL INFO + SUBSCRIBE */}
        <div className="flex items-center justify-between mt-6 mb-6">
          {video.owner?._id && (
            <Link to={`/channel/${video.owner.username}`}
              className="flex items-center gap-4"
            >
              <img
                src={video.owner.avatar}
                alt="channel"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold hover:underline">
                  {video.owner.username}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  👤 {subscribersCount.toLocaleString()} subscribers
                </p>
              </div>
            </Link>
          )}

          {/* 🚫 Hide Subscribe button for own channel */}
          {!isOwnChannel && (
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className={`px-5 py-2 rounded font-semibold transition ${
                isSubscribed
                  ? "bg-gray-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              } ${subLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {subLoading
                ? "Please wait..."
                : isSubscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          )}
        </div>

        {/* 📄 DESCRIPTION */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-300">{video.description}</p>
        </div>

      </div>
    </div>
  );
};

export default WatchVideo;
