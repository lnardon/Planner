import AnimatedText from "animated-text-letters";
import { apiHandler } from "@/utils/apiHandler";
import { useSettingsStore } from "@/utils/settingsStore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Login = ({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (val: boolean) => void;
}) => {
  const setRangeStart = useSettingsStore((state) => state.setRangeStart);
  const setRangeEnd = useSettingsStore((state) => state.setRangeEnd);
  const setDisableNotifications = useSettingsStore(
    (state) => state.setDisableNotifications
  );
  const [hasUserRegistered, setHasUserRegistered] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  async function handleLogin() {
    setIsLoggingIn(true);
    const toastId = toast.info("Logging in...");
    let raw = await apiHandler(
      "/login",
      "POST",
      "application/json",
      JSON.stringify({ username, password })
    );

    if (raw.status != 200) {
      toast.update(toastId, {
        render: "Error logging in. Please try again.",
        type: "error",
        isLoading: false,
      });
      setIsLoggingIn(false);
      return;
    }

    raw.json().then((data) => {
      setRangeStart(data.rangeStart);
      setRangeEnd(data.rangeEnd);
      setDisableNotifications(data.disableNotifications);
      localStorage.setItem("token", data.token);
      toast.update(toastId, {
        render: "Logged in successfully.",
        type: "success",
        isLoading: false,
        autoClose: 1900,
      });
      setIsLoggedIn(true);
    });

    setIsLoggingIn(false);
  }

  async function checkUser() {
    let raw = await apiHandler("/hasUserRegistered", "GET", "application/json");
    if (raw.status != 200) {
      toast.warn("Error checking if user has registered.");
      return;
    }
    raw.json().then((data) => {
      if (data != hasUserRegistered) {
        setHasUserRegistered(data);
      }
    });
  }

  async function createAccount() {
    toast.info("Creating account...");
    setIsLoggingIn(true);
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
    setIsLoggingIn(false);
  }

  useEffect(() => {
    fetch("/isTokenValid", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}` || "",
      },
    }).then((res) => {
      if (res.status === 200) {
        setIsLoggedIn(true);
        return;
      }
      checkUser();
    });
  }, []);

  return (
    <div className="flex justify-center items-center w-full flex-1">
      <div className="flex flex-col items-center text-black w-96">
        <img src="/calendar.png" alt="Logo" className="w-40 mb-8" />
        <div className="text-white mb-12 text-5xl font-bold">
          <AnimatedText
            text="Planner"
            delay={36}
            animation="slide-down"
            easing="ease-in-out"
            animationDuration={505}
            transitionOnlyDifferentLetters={true}
          />
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
          className={`bg-indigo-600 text-white rounded-md p-2 mt-4 w-full text-center cursor-pointer font-bold text-lg ${
            isLoggingIn && "opacity-40 cursor-not-allowed"
          }"}}`}
          disabled={isLoggingIn}
        >
          {hasUserRegistered
            ? isLoggingIn
              ? "Loading..."
              : "Login"
            : "Create account"}
        </button>
      </div>
    </div>
  );
};

export default Login;
