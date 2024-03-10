import { cn } from "@/lib/utils";
import AnimatedText from "../AnimatedText";
import styles from "./styles.module.css";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const Header: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div
      className={cn(
        "w-full rounded-md p-4 flex justify-between items-center",
        styles.container
      )}
    >
      <div className="text-3xl">
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
        <DropdownMenuContent>
          <DropdownMenuLabel>Account menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-3xl">Settings</SheetTitle>
            <SheetDescription>
              Currently there are no settings to configure.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Header;
