import { useState } from "react";
import styles from "./styles.module.css";

const events = [
  {
    id: 1,
    date: "2024-01-27",
    start: 0,
    end: 2,
    title: "World domination",
  },
];

const Timesheet: React.FC = () => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  const handleMouseDown = (hourIndex: number) => {
    setIsDragging(true);
    setStartHour(hourIndex);
    setEndHour(null);
  };

  const handleMouseEnter = (hourIndex: number) => {
    if (isDragging && startHour !== null) {
      setEndHour(hourIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (startHour !== null && endHour !== null) {
      console.log("Event created from", startHour, "to", endHour);
    }
  };

  return (
    <div className={styles.timesheet}>
      {hours.map((hour, index) => (
        <div
          key={hour}
          className={`relative flex gap-2 border-t-2 px-2 py-4 rounded-xs h-16 flex-col ${
            styles.hourBlock
          } ${
            isDragging &&
            startHour !== null &&
            endHour !== null &&
            index >= startHour &&
            index <= endHour
              ? "bg-white text-black"
              : ""
          } ${
            events.some((event) => {
              return event.start == index;
            })
              ? "h-32 bg-green-500"
              : ""
          }`}
          onClick={() => {
            setStartHour(index);
            setEndHour(index);
            console.log("Event created from", startHour, "to", endHour);
          }}
          onMouseDown={() => handleMouseDown(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseUp={handleMouseUp}
          style={{ animationDelay: `${index * 64}ms` }}
        >
          <div
            className={`select-none ${
              events.some((event) => {
                return event.start == index;
              })
                ? "text-white font-bold text-l bg-black h-fit px-2 py-0.5 rounded-sm w-fit"
                : ""
            }`}
          >
            {hour}
          </div>
          <div className="w-full">
            {events.map((event) => {
              if (event.start == index) {
                return (
                  <div
                    key={event.id}
                    className={`rounded-sm font-bold text-xl text-black bg-black text-white bg-opacity-50 p-2 h-16`}
                  >
                    {event.title}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timesheet;
