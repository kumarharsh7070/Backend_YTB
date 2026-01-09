import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import UploadVideo from "./pages/UploadVideo";
import ProtectedRoute from "./routes/ProtectedRoute";
import WatchVideo from "./pages/WatchVideo";
import Channel from "./pages/Channel";
import EditProfile from "./pages/EditProfile";
import EditVideo from "./pages/EditVideo";
import PlaylistsTab from "./pages/PlaylistsTab";
import PlaylistDetails from "./pages/PlaylistDetails";
import CreatePlaylist from "./pages/CreatePlaylist";
import EditPlaylist from "./pages/EditPlaylist";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-black dark:bg-black dark:text-white transition-colors">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/watch/:videoId" element={<WatchVideo />} />

        {/* Protected routes */}
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistsTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-playlist/:playlistId"
          element={
            <ProtectedRoute>
              <EditPlaylist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-playlist"
          element={
            <ProtectedRoute>
              <CreatePlaylist />
            </ProtectedRoute>
          }
        />
        <Route path="/channel/:username" element={<Channel />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-video/:videoId" element={<EditVideo />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadVideo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
