import { cn } from "@/lib/utils";
import AnimatedText from "../AnimatedText";
import styles from "./styles.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div
      className={cn(
        "w-full rounded-md p-4 border-2 flex w-full justify-between items-center",
        styles.container
      )}
    >
      <AnimatedText text="Planner" />
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
