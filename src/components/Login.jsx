// src/components/Login.jsx
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login gagal", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex justify-center my-4">
      {user ? (
        <div className="flex items-center space-x-4">
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          <span>{user.displayName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Login dengan Google
        </button>
      )}
    </div>
  );
}
