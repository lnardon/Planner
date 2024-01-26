import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const Header: React.FC = () => {
  return (
    <div className={cn("w-full rounded-md p-4 border-2", styles.container)}>
      <h1 className="font-bold text-4xl">Planner</h1>
    </div>
  );
};

export default Header;
