import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import EventDetail from "../EventDetail";
import CreateEvent from "../CreateEvent";
import { apiHandler } from "@/utils/apiHandler";
import { useSettingsStore } from "@/utils/settingsStore";

const Timesheet = ({
  currentDate,
  setOpen,
}: {
  currentDate: Date | undefined;
  setOpen: any;
}) => {
  const rangeStart = useSettingsStore((state) => state.rangeStart);
  const rangeEnd = useSettingsStore((state) => state.rangeEnd);

  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number | null>(startHour + 1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerEvent, setDrawerEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getHours());
  const [minutes, setMinutes] = useState<number>(new Date().getMinutes());
  const [isToday, setIsToday] = useState<boolean>(
    date ? date.toDateString() === new Date().toDateString() : false
  );

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );

  const handleMouseDown = (hourIndex: number) => {
    setIsDragging(true);
    setStartHour(hourIndex);
    setEndHour(hourIndex);
  };

  const handleMouseEnter = (hourIndex: number) => {
    if (isDragging) {
      setEndHour(hourIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (startHour !== null && endHour !== null) {
      setOpen(true);
    }
  };

  useEffect(() => {
    (async () => {
      const raw = await apiHandler(
        `/getEvents?date=${date?.toISOString().split("T")[0]}`,
        "GET",
        "application/json"
      );
      if (raw.ok) {
        raw.json().then((data) => {
          setEvents(data || []);
        });
      }
    })();
  }, [date]);

  useEffect(() => {
    setDate(currentDate);
    setIsToday(
      currentDate
        ? currentDate.toDateString() === new Date().toDateString()
        : false
    );
  }, [currentDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getHours());
      setMinutes(new Date().getMinutes());
      setIsToday(
        currentDate
          ? currentDate.toDateString() === new Date().toDateString()
          : false
      );
    }, 60000);
    return () => clearInterval(interval);
  });

  return (
    <div className={styles.timesheet}>
      {hours.map((_, index) => {
        const currentEvent = events.find(
          (event) => index >= event.start && index <= event.end
        );
        const isWithinRange = index >= rangeStart && index <= rangeEnd;
        const isWithinEvent = events.some(
          (event) => index > event.start && index <= event.end
        );
        const eventDuration = currentEvent
          ? currentEvent.end - currentEvent.start
          : 0;
        const hasEventInRange = events.some(
          (event) => index > event.start && index <= event.end
        );

        const signs = () => {
          let returnVal = " | ";
          let idx = eventDuration + 1;
          while (idx > 0) {
            returnVal += " - ";
            idx--;
          }
          returnVal += " | ";
          return returnVal;
        };

        const currentTimeLinePosition = () => {
          const currentTotalMinutes = currentTime * 60 + minutes;
          let blockStartMinutes = index * 60;
          if (currentEvent) {
            blockStartMinutes = currentEvent.start * 60;
          }
          const minutesSinceBlockStart =
            currentTotalMinutes - blockStartMinutes;
          const blockDurationMinutes = currentEvent
            ? (currentEvent.end + 1 - currentEvent.start) * 60
            : 60;
          return (minutesSinceBlockStart / blockDurationMinutes) * 100;
        };

        return (
          !isWithinEvent &&
          isWithinRange && (
            <div key={index} className="relative flex w-full">
              {isToday && (index === currentTime || hasEventInRange) && (
                <div
                  className="absolute left-0 w-full h-1 bg-indigo-600 rounded shadow-lg z-10 animate-pulse transition-all"
                  style={{
                    top: `${currentTimeLinePosition().toFixed(2)}%`,
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                key={index}
                className={`${
                  currentEvent ? styles.hourBlock : styles.hour
                } relative flex gap-2 border-t-2 px-2 py-4 rounded-xs ${
                  currentEvent ? `h-40 bg-green-600` : "h-16"
                } flex-col ${
                  isDragging &&
                  startHour !== null &&
                  endHour !== null &&
                  index >= startHour &&
                  index <= endHour
                    ? "bg-green-500 bg-opacity-30 text-white rounded-sm"
                    : ""
                }`}
                style={{
                  animationDelay: `${index * 32}ms`,
                  filter:
                    (isToday && currentEvent?.end < currentTime) ||
                    (!isToday && currentEvent)
                      ? "opacity(0.5)"
                      : "",
                }}
                onClick={
                  !currentEvent
                    ? () => {
                        setStartHour(index);
                        setEndHour(index);
                        setOpen(true);
                      }
                    : () => {
                        setIsDrawerOpen(true);
                        setDrawerEvent(currentEvent);
                      }
                }
                onTouchEnd={
                  !currentEvent
                    ? () => {
                        setStartHour(index);
                        setEndHour(index);
                        setOpen(true);
                      }
                    : () => {
                        setIsDrawerOpen(true);
                        setDrawerEvent(currentEvent);
                      }
                }
                onMouseDown={
                  currentEvent ? () => {} : () => handleMouseDown(index)
                }
                onMouseEnter={
                  currentEvent
                    ? () => setEndHour(null)
                    : () => handleMouseEnter(index)
                }
                onMouseUp={handleMouseUp}
              >
                <div
                  className={`select-none ${
                    currentEvent
                      ? "text-white font-regular bg-black h-fit px-2 py-0.5 rounded-sm w-fit z-10"
                      : ""
                  }`}
                >
                  {currentEvent
                    ? `${hours[currentEvent.start]} ${signs()} ${hours[
                        currentEvent.end
                      ].replace(":00", ":59")}`
                    : hours[index]}
                </div>
                {currentEvent && (
                  <div className="rounded-sm font-bold text-xl bg-black text-white bg-opacity-50 p-2 h-full">
                    {currentEvent.name}
                  </div>
                )}
              </div>
            </div>
          )
        );
      })}
      <CreateEvent
        events={events}
        hours={hours}
        setEvents={setEvents}
        setOpen={setOpen}
        initialStart={startHour}
        initialEnd={endHour || startHour}
        currentDate={currentDate || new Date()}
      />
      <EventDetail
        drawerEvent={drawerEvent}
        events={events}
        isDrawerOpen={isDrawerOpen}
        setEvents={setEvents}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </div>
  );
};

export default Timesheet;
