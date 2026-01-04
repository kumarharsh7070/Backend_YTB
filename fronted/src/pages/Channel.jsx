import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PlaylistsTab from "../pages/PlaylistsTab";
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
  const [activeTab, setActiveTab] = useState("videos"); // videos | playlists | about

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

  /* ================= SUBSCRIBE ================= */
  const handleSubscribe = async () => {
    if (!token) return alert("Please login");

    setSubLoading(true);
    try {
      await api.post(`/subscriptions/${channel._id}`);
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

  /* ================= DELETE VIDEO ================= */
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;

    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch {
      alert("Failed to delete video");
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

      {/* ================= COVER ================= */}
      <div className="h-48 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600"></div>

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex items-center gap-6">
            <img
              src={channel.avatar}
              alt="channel"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-900"
            />

            <div>
              <h1 className="text-3xl font-bold">{channel.username}</h1>
              <p className="text-gray-400 mt-1">
                👤 {subscribersCount.toLocaleString()} subscribers
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnChannel ? (
              <>
                <Link to="/upload" className="px-5 py-2 bg-indigo-600 rounded">
                  Upload
                </Link>
                 <Link
      to="/create-playlist"
      className="px-5 py-2 bg-gray-800 rounded hover:bg-gray-700"
    >
      Create Playlist
    </Link>

                <Link to="/edit-profile" className="px-5 py-2 bg-gray-800 rounded">
                  Edit Profile
                </Link>
              </>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`px-6 py-2 rounded ${
                  isSubscribed
                    ? "bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {subLoading ? "Please wait..." : isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="max-w-6xl mx-auto px-6 mt-8 border-b border-gray-800 flex gap-8">
        {["videos", "playlists", "about"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize ${
              activeTab === tab
                ? "border-b-2 border-white text-white"
                : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="max-w-6xl mx-auto p-8">

        {/* VIDEOS */}
        {activeTab === "videos" && (
          videos.length === 0 ? (
            <p className="text-gray-400">No videos uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="bg-gray-900 rounded-lg overflow-hidden">
                  <Link to={`/watch/${video._id}`}>
                    <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                  </Link>

                  <div className="p-4">
                    <h3 className="font-semibold truncate">{video.title}</h3>

                    {isOwnChannel && (
                      <div className="flex gap-2 mt-3">
                        <Link to={`/edit-video/${video._id}`} className="px-3 py-1 bg-blue-600 rounded text-sm">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="px-3 py-1 bg-red-600 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* PLAYLISTS */}
        {activeTab === "playlists" && (
  <PlaylistsTab
    channelId={channel._id}
    isOwnChannel={isOwnChannel}
  />
)}

        {/* ABOUT */}
        {activeTab === "about" && (
          <div className="bg-gray-900 rounded-xl p-6">
            <p>Channel: {channel.username}</p>
            <p>Subscribers: {subscribersCount}</p>
            <p>Joined: {new Date(channel.createdAt).toDateString()}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Channel;
