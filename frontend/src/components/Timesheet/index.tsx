import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronRight, Check } from "lucide-react";
import { Separator } from "../ui/separator";
import { v4 as uuidv4 } from "uuid";

const Timesheet = ({
  currentDate,
  setOpen,
}: {
  currentDate: any;
  setOpen: any;
}) => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([
    {
      id: "a3sgsdfg",
      date: "2024-01-27",
      start: 0,
      end: 1,
      name: "Save the world",
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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

  function handleCreateEvent() {
    if (startHour !== null && endHour !== null) {
      let newEvent = {
        id: uuidv4(),
        date: date?.toISOString().split("T")[0],
        start: startHour,
        end: endHour,
        name,
        description: description,
      };
      fetch("/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      }).then((res) => {
        if (!res.ok) {
          alert("Error creating event");
        }

        setOpen(false);
        setEvents([...events, newEvent]);
      });
    }
  }

  useEffect(() => {
    fetch(
      `/getEvents?date=${currentDate?.toISOString().split("T")[0]}`,
      {}
    ).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setEvents(data || []);
        });
      }
    });
  }, [currentDate]);

  return (
    <div className={styles.timesheet}>
      {hours.map((_, index) => {
        const eventStart = events.find((event) => event.start === index);
        const isWithinEvent = events.some(
          (event) => event.start < index && event.end >= index
        );

        return (
          !isWithinEvent && (
            <div
              key={index}
              className={`${
                eventStart ? styles.hourBlock : styles.hour
              } relative flex gap-2 border-t-2 px-2 py-4 rounded-xs ${
                eventStart ? `h-40 bg-green-500` : "h-16"
              } flex-col`}
              onClick={
                !eventStart
                  ? () => {
                      setStartHour(index);
                      setEndHour(index);
                      setOpen(true);
                    }
                  : undefined
              }
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseUp={handleMouseUp}
              style={{
                animationDelay: `${index * 64 + eventStart ? index * 32 : 0})
                }ms`,
              }}
            >
              <div
                className={`select-none ${
                  eventStart
                    ? "text-white font-bold text-l bg-black h-fit px-2 py-0.5 rounded-sm w-fit"
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
                <div className="rounded-sm font-bold text-xl text-black bg-black text-white bg-opacity-50 p-2 h-full">
                  {eventStart.name}
                </div>
              )}
            </div>
          )
        );
      })}

      <DialogContent>
        <DialogHeader className="mb-0">
          <DialogTitle className="text-bold text-2xl">Create event</DialogTitle>
        </DialogHeader>
        <Separator className="mb-0" />

        {startHour !== null && endHour !== null && (
          <div className="flex gap-0.5">
            <Badge className="text-sm font-bold bg-green-400">{`${
              startHour % 12
            }:00 ${startHour < 12 ? "am" : "pm"}`}</Badge>
            <ChevronRight />
            <Badge className="text-sm font-bold bg-green-400">{`${
              endHour % 12
            }:59 ${endHour < 12 ? "am" : "pm"}`}</Badge>
          </div>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Event name"
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Event description..."
          className="w-full h-32 mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button className="font-bold w-full" onClick={handleCreateEvent}>
          Done
          <Check className="pl-2" />
        </Button>
      </DialogContent>
    </div>
  );
};

export default Timesheet;
