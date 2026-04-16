import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import api from "../../api/axios";
import { AxiosError } from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* 🔥 Redirect if already logged in */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && window.location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* 🔥 LOGIN HANDLER */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admin/login", {
        username: username.trim(),
        password: password.trim(),
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      
      <div className="w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 shadow-inner">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              ElecTrack
            </h1>
            <p className="text-gray-500 text-sm">Admin Login Portal</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 focus-within:ring-2 focus-within:ring-blue-500 transition">
                <User className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={username}
                  autoFocus
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="w-full py-3 outline-none bg-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 focus-within:ring-2 focus-within:ring-blue-500 transition">
                <Lock className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full py-3 outline-none bg-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}