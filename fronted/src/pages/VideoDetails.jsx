import CommentList from "../components/comments/CommentList";

const VideoDetails = ({ video, currentUser }) => {
  return (
    <div>
      {/* VIDEO PLAYER */}
      <video controls src={video.videoUrl} />

      {/* VIDEO TITLE */}
      <h2>{video.title}</h2>

      {/* COMMENT SECTION */}
      <CommentList
        videoId={video._id}
        currentUserId={currentUser._id}
      />
    </div>
  );
};

export default VideoDetails;
