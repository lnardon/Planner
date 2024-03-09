import AnimatedText from "@/components/AnimatedText";
import { useState } from "react";
import { toast } from "react-toastify";

const Login = ({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (val: boolean) => void;
}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function handleLogin() {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((res) => {
      if (res.status != 200) {
        toast.warn("Error logging in. Please try again.");
      }
      res.json().then((data) => {
        localStorage.setItem("token", data);
        setIsLoggedIn(true);
      });
    });
  }

  return (
    <div className="flex justify-center items-center w-full flex-1">
      <div className="flex flex-col items-center text-black w-96">
        <img src="/calendar.png" alt="Logo" className="w-40 mb-2" />
        <div className="text-white mb-12 text-5xl">
          <AnimatedText text="Planner" />
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="rounded-md border p-2 mb-4 w-full text-lg font-medium"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-md border p-2 mb-8 w-full text-lg font-medium"
        />
        <button
          onClick={handleLogin}
          className="bg-indigo-600 text-white rounded-md p-2 mt-4 w-full text-center cursor-pointer font-bold text-lg"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
