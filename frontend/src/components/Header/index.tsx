import { cn } from "@/lib/utils";
import AnimatedText from "../AnimatedText";
import styles from "./styles.module.css";

const Header: React.FC = () => {
  return (
    <div className={cn("w-full rounded-md p-4 border-2", styles.container)}>
      <AnimatedText text="Planner" />
    </div>
  );
};

export default Header;
