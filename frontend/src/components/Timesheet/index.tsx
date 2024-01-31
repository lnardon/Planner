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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const Timesheet = ({
  currentDate,
  setOpen,
}: {
  currentDate: Date | undefined;
  setOpen: any;
}) => {
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerEvent, setDrawerEvent] = useState<any>(null);
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [events, setEvents] = useState<any[]>([
    {
      id: "0",
      date: date?.toISOString().split("T")[0],
      start: 0,
      end: 1,
      name: "Save the world",
    },
  ]);

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
          return;
        }

        setOpen(false);
        setStartHour(null);
        setEndHour(null);
        setDescription("");
        setName("");
        setEvents([...events, newEvent]);
      });
    }
  }

  function handleDeleteEvent() {
    if (drawerEvent) {
      fetch("/deleteEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: drawerEvent.id,
        }),
      }).then((res) => {
        if (!res.ok) {
          alert("Error deleting event");
          return;
        }

        setIsDrawerOpen(false);
        setEvents(events.filter((event) => event.id !== drawerEvent.id));
      });
    }
  }

  useEffect(() => {
    fetch(`/getEvents?date=${date?.toISOString().split("T")[0]}`).then(
      (res) => {
        if (res.ok) {
          res.json().then((data) => {
            setEvents(data || []);
          });
        }
      }
    );
  }, [date]);

  useEffect(() => {
    setDate(currentDate);
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
              } flex-col ${
                isDragging &&
                startHour !== null &&
                endHour !== null &&
                index >= startHour &&
                index <= endHour
                  ? "bg-green-400 bg-opacity-30 text-white rounded-sm"
                  : ""
              } `}
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
              onMouseDown={eventStart ? () => {} : () => handleMouseDown(index)}
              onMouseEnter={
                eventStart
                  ? () => setEndHour(null)
                  : () => handleMouseEnter(index)
              }
              onMouseUp={handleMouseUp}
              style={{
                animationDelay: `${index * 32}ms`,
              }}
            >
              <div
                className={`select-none ${
                  eventStart
                    ? "text-white font-regular bg-black h-fit px-2 py-0.5 rounded-sm w-fit"
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
          <DialogTitle className="text-bold text-2xl text-start">
            Create event
          </DialogTitle>
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

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="w-full flex items-center">
          <div className="min-w-96 max-w-[35rem] w-full m-4 p-6 bg-green-500 rounded-md">
            <div className="p-2 bg-black bg-opacity-80 rounded-md">
              <DrawerHeader>
                <DrawerTitle className="mb-0 text-2xl">
                  {drawerEvent?.name}
                </DrawerTitle>
                <Separator className="mb-2 bg-white" />
                {drawerEvent?.description && (
                  <DrawerDescription className="mb-4">
                    {drawerEvent?.description}
                  </DrawerDescription>
                )}
                {drawerEvent && (
                  <div className="flex gap-0.5">
                    <Badge className="text-sm font-bold bg-black text-white border-solid border-2 border-white hover:bg-white hover:text-black">{`${
                      drawerEvent?.start % 12
                    }:00 ${drawerEvent?.start < 12 ? "am" : "pm"}`}</Badge>
                    <ChevronRight />
                    <Badge className="text-sm font-bold bg-black text-white border-solid border-2 border-white hover:bg-white hover:text-black">{`${
                      drawerEvent.end % 12
                    }:59 ${drawerEvent?.end < 12 ? "am" : "pm"}`}</Badge>
                  </div>
                )}
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>
                  <Button variant="outline" className="w-full hover:bg-black">
                    Close
                  </Button>
                </DrawerClose>
                <Button
                  className="bg-red-600 font-bold text-white hover:bg-red-600"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </Button>
              </DrawerFooter>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Timesheet;
