import { cn } from "@/lib/utils";
import AnimatedText from "animated-text-letters";
import styles from "./styles.module.css";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Settings from "../Settings";
import { useState } from "react";
import { Settings as SettingsIcons, LogOut } from "lucide-react";

const Header: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("settings");
    window.location.reload();
  }

  return (
    <div
      className={cn(
        "w-full rounded-md py-4 flex justify-between items-center",
        styles.container
      )}
    >
      <div className="text-4xl flex gap-4 items-center">
        <img src="/calendar.png" alt="Logo" className="w-10" />
        <AnimatedText text="Planner" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="py-1 px-4 rounded-lg flex gap-1 items-center cursor-pointer border-2 border-white border-opacity-60 focus-visible:ring-0 hover:border-opacity-100 transition-all duration-200">
            Menu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-1 flex items-start flex-col">
          <DropdownMenuLabel>Account menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer w-full"
            onClick={() => setIsSettingsOpen(true)}
          >
            <SettingsIcons className="mr-2 w-4 h-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer w-full text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 w-4 h-4" color="red" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Settings
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
    </div>
  );
};

export default Header;
