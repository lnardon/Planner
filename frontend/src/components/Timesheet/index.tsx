import { useState } from "react";
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
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";

const events = [
  {
    id: 1,
    date: "2024-01-27",
    start: 0,
    end: 2,
    title: "World domination",
  },
  {
    id: 1,
    date: "2024-01-27",
    start: 3,
    end: 5,
    title: "Rest",
  },
];

const Timesheet = ({ setOpen }: { setOpen: any }) => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
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
      fetch("/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date?.toISOString().split("T")[0],
          start: startHour,
          end: endHour,
          title: name,
          description,
        }),
      }).then((res) => {
        if (!res.ok) {
          alert("Error creating event");
        }
        window.location.reload();
      });
    }
  }

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
              return (
                event.start == index ||
                (event.start < index && event.end > index)
              );
            })
              ? "h-32 bg-green-500"
              : ""
          }`}
          onClick={() => {
            setStartHour(index);
            setEndHour(index);
            setOpen(true);
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-bold text-2xl mb-1">
            Create event
          </DialogTitle>
        </DialogHeader>

        {startHour !== null && endHour !== null && (
          <div className="flex gap-0.5">
            <Badge>{`${startHour % 12}:00 ${
              startHour < 12 ? "am" : "pm"
            }`}</Badge>
            <ChevronRight />
            <Badge>{`${endHour % 12}:59 ${endHour < 12 ? "am" : "pm"}`}</Badge>
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
          Create
        </Button>
      </DialogContent>
    </div>
  );
};

export default Timesheet;
