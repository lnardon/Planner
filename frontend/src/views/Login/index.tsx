import { useState } from "react";

const Login = ({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (val: boolean) => void;
}) => {
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function handleLogin() {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, password }),
    }).then((res) => {
      if (res.status === 200) {
        localStorage.setItem("token", "token");
        setIsLoggedIn(true);
      } else {
        alert("Invalid credentials");
      }
    });
  }

  return (
    <div className="flex justify-center items-center w-full flex-1">
      <div className="flex flex-col items-center text-black w-96">
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Username"
          className="rounded-md border p-2 mb-4 w-full text-lg"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-md border p-2 mb-8 w-full text-lg"
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
