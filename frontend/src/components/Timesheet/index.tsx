import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import EventDetail from "../EventDetail";
import CreateEvent from "../CreateEvent";

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

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );

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
      setOpen(true);
    }
  };

  useEffect(() => {
    fetch(`/getEvents?date=${date?.toISOString().split("T")[0]}`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setEvents(data || []);
        });
      }
    });
  }, [date]);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  useEffect(() => {
    setEndHour(startHour + 1);
  }, [startHour]);

  const currentTime = new Date().getHours();
  const minutes = new Date().getMinutes();
  const isToday = date && date.toDateString() === new Date().toDateString();

  return (
    <div className={styles.timesheet}>
      {hours.map((_, index) => {
        const eventStart = events.find((event) => event.start === index);
        const isWithinEvent = events.some(
          (event) => index > event.start && index <= event.end
        );
        const eventDuration = eventStart
          ? eventStart.end + 1 - eventStart.start
          : 0;

        return (
          !isWithinEvent && (
            <div key={index} className="relative flex w-full">
              {isToday && index === currentTime && (
                <div
                  className="absolute left-0 w-full h-1 bg-indigo-700 rounded shadow-md z-10"
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
