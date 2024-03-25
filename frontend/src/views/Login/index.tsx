import AnimatedText from "@/components/AnimatedText";
import { apiHandler } from "@/utils/apiHandler";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Login = ({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (val: boolean) => void;
}) => {
  const [hasUserRegistered, setHasUserRegistered] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleLogin() {
    toast.info("Logging in...");
    let raw = await apiHandler(
      "/login",
      "POST",
      "application/json",
      JSON.stringify({ username, password })
    );

    if (raw.status != 200) {
      toast.error("Error logging in. Please try again.");
      return;
    }

    raw.json().then((data) => {
      localStorage.setItem("token", data);
      setIsLoggedIn(true);
    });
  }

  async function checkUser() {
    let raw = await apiHandler("/hasUserRegistered", "GET", "application/json");
    if (raw.status != 200) {
      toast.warn("Error checking if user has registered.");
      return;
    }
    raw.json().then((data) => {
      setHasUserRegistered(data);
    });
  }

  async function createAccount() {
    toast.info("Creating account...");
    let raw = await apiHandler(
      "/register",
      "POST",
      "application/json",
      JSON.stringify({ username, password })
    );
    if (raw.status != 200) {
      toast.warn("Error creating account. Please try again.");
      return;
    }
    toast.success("Account created successfully. Please login and enjoy!");
    setHasUserRegistered(true);
  }

  useEffect(() => {
    fetch("/isTokenValid", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.status === 200) {
        setIsLoggedIn(true);
        return;
      }
      checkUser();
    });
  });

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
          onClick={hasUserRegistered ? handleLogin : createAccount}
          className="bg-indigo-600 text-white rounded-md p-2 mt-4 w-full text-center cursor-pointer font-bold text-lg"
        >
          {hasUserRegistered ? "Login" : "Create account"}
        </button>
      </div>
    </div>
  );
};

export default Login;
