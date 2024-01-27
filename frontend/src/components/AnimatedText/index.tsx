import styles from "./styles.module.css";

const AnimatedText = ({ text }: { text: string | undefined }) => {
  return (
    <div className={styles.container}>
      {text?.split("").map((char, index) => {
        return (
          <div
            key={index + char}
            className={styles.letter}
            style={{ animationDelay: `${index * 32}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedText;
