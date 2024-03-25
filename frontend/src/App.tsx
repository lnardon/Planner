import { useState } from "react";
import "./App.css";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <div className="app">
      {isLoggedIn ? <Dashboard /> : <Login setIsLoggedIn={setIsLoggedIn} />}
    </div>
  );
}

export default App;
