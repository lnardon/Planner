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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  return (
    <div
      className={cn(
        "w-full rounded-md p-4 border-2 flex justify-between items-center",
        styles.container
      )}
    >
      <div className="text-3xl">
        <AnimatedText text="Planner" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
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
