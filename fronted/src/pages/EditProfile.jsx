import { useEffect, useState } from "react";
import api from "../api/axios";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH CURRENT USER ================= */
  useEffect(() => {
    api.get("/users/current-user").then((res) => {
      setUsername(res.data.data.username);
      setEmail(res.data.data.email);
    });
  }, []);

  /* ================= UPDATE ACCOUNT DETAILS ================= */
  const handleUpdateDetails = async () => {
  setLoading(true);
  setMessage("");

  try {
    console.log("UPDATE PAYLOAD:", { username, email }); // 👈 debug

    await api.patch("/users/update-account", {
      username,
      email,
    });

    setMessage("Account details updated successfully ✅");
  } catch (err) {
    setMessage(
      err.response?.data?.message ||
      "Failed to update account details ❌"
    );
  } finally {
    setLoading(false);
  }
};


  /* ================= UPDATE AVATAR ================= */
  const handleAvatarUpload = async () => {
    if (!avatar) return;

    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
      await api.patch("/users/avatar", formData);
      setMessage("Avatar updated successfully ✅");
    } catch {
      setMessage("Failed to update avatar ❌");
    }
  };

  /* ================= UPDATE COVER IMAGE ================= */
  const handleCoverUpload = async () => {
    if (!cover) return;

    const formData = new FormData();
    formData.append("coverImage", cover);

    try {
      await api.patch("/users/cover-image", formData);
      setMessage("Cover image updated successfully ✅");
    } catch {
      setMessage("Failed to update cover image ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-xl">

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile
        </h2>

        {message && (
          <p className="text-green-400 mb-4">{message}</p>
        )}

        {/* ================= ACCOUNT DETAILS ================= */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            Account Details
          </h3>

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-3 px-4 py-2 bg-gray-800 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 px-4 py-2 bg-gray-800 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={handleUpdateDetails}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Update Details
          </button>
        </div>

        {/* ================= AVATAR ================= */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            Profile Picture
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />

          <button
            onClick={handleAvatarUpload}
            className="mt-2 px-5 py-2 bg-gray-800 rounded"
          >
            Upload Avatar
          </button>
        </div>

        {/* ================= COVER IMAGE ================= */}
        <div>
          <h3 className="font-semibold mb-2">
            Channel Cover Image
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />

          <button
            onClick={handleCoverUpload}
            className="mt-2 px-5 py-2 bg-gray-800 rounded"
          >
            Upload Cover
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfile;
