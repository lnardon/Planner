import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import EventDetail from "../EventDetail";
import CreateEvent from "../CreateEvent";
import { apiHandler } from "@/utils/apiHandler";

const Timesheet = ({
  currentDate,
  setOpen,
}: {
  currentDate: Date | undefined;
  setOpen: any;
}) => {
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number | null>(startHour + 1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerEvent, setDrawerEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([
    {
      id: "0",
      date: date?.toISOString().split("T")[0],
      start: 1,
      end: 2,
      name: "Save the world",
      description: "Tonight",
    },
  ]);
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
        const eventStart = events.find((event) => event.start === index);
        const isWithinEvent = events.some(
          (event) => index > event.start && index <= event.end
        );
        const eventDuration = isWithinEvent
          ? events.find((event) => index > event.start && index <= event.end)
              .end +
            1 -
            events.find((event) => index > event.start && index <= event.end)
              .start
          : eventStart
          ? eventStart.end + 1 - eventStart.start
          : 1;

        return (
          !isWithinEvent && (
            <div key={index} className="relative flex w-full">
              {isToday && (index === currentTime || isWithinEvent) && (
                <div
                  className="absolute left-0 w-full h-1 bg-indigo-700 rounded shadow-md z-10 animate-pulse transition-all duration-10000"
                  style={{
                    top: `${(minutes * 100) / (60 * eventDuration)}%`,
                  }}
                />
              )}
              <div
                key={index}
                className={`${
                  eventStart ? styles.hourBlock : styles.hour
                } relative flex gap-2 border-t-2 px-2 py-4 rounded-xs ${
                  eventStart ? `h-40 bg-green-500` : "h-16"
                } flex-col ${
                  isDragging &&
                  startHour !== null &&
                  endHour !== null &&
                  index >= startHour &&
                  index <= endHour
                    ? "bg-green-400 bg-opacity-30 text-white rounded-sm"
                    : ""
                }`}
                onClick={
                  !eventStart
                    ? () => {
                        setStartHour(index);
                        setEndHour(index);
                        setOpen(true);
                      }
                    : () => {
                        setIsDrawerOpen(true);
                        setDrawerEvent(eventStart);
                      }
                }
                onMouseDown={
                  eventStart ? () => {} : () => handleMouseDown(index)
                }
                onMouseEnter={
                  eventStart
                    ? () => setEndHour(null)
                    : () => handleMouseEnter(index)
                }
                onMouseUp={handleMouseUp}
              >
                <div
                  className={`select-none ${
                    eventStart
                      ? "text-white font-regular bg-black h-fit px-2 py-0.5 rounded-sm w-fit z-10"
                      : ""
                  }`}
                >
                  {eventStart
                    ? `${hours[eventStart.start]} - ${hours[
                        eventStart.end
                      ].replace(":00", ":59")}`
                    : hours[index]}
                </div>
                {eventStart && (
                  <div className="rounded-sm font-bold text-xl bg-black text-white bg-opacity-50 p-2 h-full">
                    {eventStart.name}
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
