import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  // 1️⃣ Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2️⃣ File states
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // 3️⃣ UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 4️⃣ Submit handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!avatar) {
      setError("Avatar is required");
      return;
    }

    setLoading(true);

    try {
      // 5️⃣ Create FormData (IMPORTANT)
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatar);

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      // 6️⃣ API call
      await api.post("/users/register", formData);

      setSuccess("Account created successfully 🎉");

      // 7️⃣ Redirect to login
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-2xl">

        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Create Account
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {success && <p className="text-green-400 text-center mb-4">{success}</p>}

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded bg-gray-800 text-white outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded bg-gray-800 text-white outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded bg-gray-800 text-white outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded bg-gray-800 text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div>
            <label className="text-gray-400 text-sm">Avatar (required)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-white mt-1"
              onChange={(e) => setAvatar(e.target.files[0])}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-white mt-1"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-red-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
