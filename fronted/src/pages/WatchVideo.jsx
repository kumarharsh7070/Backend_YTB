import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const WatchVideo = () => {
  const { videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/videos/${videoId}`)
      .then((res) => {
        setVideo(res.data.data);
      })
      .catch(() => {
        setError("Video not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading video...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* 🎬 VIDEO PLAYER */}
        <div className="w-full rounded-lg overflow-hidden mb-6">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="w-full max-h-[500px] bg-black"
          />
        </div>

        {/* 📝 VIDEO DETAILS */}
        <h1 className="text-2xl font-bold mb-2">
          {video.title}
        </h1>

        <p className="text-gray-400 mb-4">
          {video.views} views •{" "}
          {new Date(video.createdAt).toDateString()}
        </p>

        {/* 👤 CHANNEL INFO */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            👤
          </div>
          <div>
            <p className="font-semibold">
              {video.ownerDetails?.email || "Unknown Channel"}
            </p>
            <p className="text-gray-400 text-sm">
              Channel
            </p>
          </div>
        </div>

        {/* 📄 DESCRIPTION */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-300">
            {video.description}
          </p>
        </div>

      </div>
    </div>
  );
};

export default WatchVideo;
