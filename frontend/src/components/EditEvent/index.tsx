import { useEffect, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/apiHandler";

const EditEvent = ({
  setOpen,
  setDrawerOpen,
  setEvents,
  events,
  initialStart,
  initialEnd,
  initialDate,
  initialName,
  initialDescription,
  id,
}: {
  setOpen: any;
  setDrawerOpen: any;
  setEvents: any;
  events: any;
  initialStart: number;
  initialEnd: number;
  initialDate: Date;
  initialName: string;
  initialDescription: string;
  id: string;
}) => {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [startHour, setStartHour] = useState<number>(initialStart);
  const [endHour, setEndHour] = useState<number>(initialEnd);
  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );

  async function handleEdit() {
    if (startHour !== null && endHour !== null && name) {
      let updatedEvent = {
        id,
        date: date,
        start: startHour,
        end: endHour,
        name,
        description: description,
      };
      let raw = await apiHandler(
        "/updateEvent",
        "POST",
        "application/json",
        JSON.stringify(updatedEvent)
      );
      if (!raw.ok) {
        toast.error("Error updating event");
        return;
      }

      setOpen(false);
      setStartHour(0);
      setEndHour(0);
      setName("");
      setDescription("");
      let updatedEvents = events.map((event: any) => {
        if (event.id === id) {
          return {
            ...event,
            ...updatedEvent,
          };
        }
        return event;
      });
      setEvents([...updatedEvents]);
      setDrawerOpen(false);
      toast.success("Event updated successfully!");
    }
  }

  useEffect(() => {
    setStartHour(initialStart);
    setEndHour(initialEnd);
  }, [initialStart, initialEnd]);

  return (
    <DialogContent>
      <DialogHeader className="mb-0">
        <DialogTitle className="text-bold text-2xl text-start">
          Edit event
        </DialogTitle>
      </DialogHeader>
      <Separator className="mb-0" />
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
      {
        <div className="flex w-full items-center justify-between gap-8">
          <Select
            value={startHour?.toString()}
            onValueChange={(val) => {
              setStartHour(parseInt(val));
              if (endHour?.toString() < val) {
                setEndHour(parseInt(val));
              }
            }}
          >
            <SelectTrigger className="w-full text-md outline-none">
              <SelectValue placeholder="Starts at" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour, index) => (
                <SelectItem
                  value={index.toString()}
                  onClick={() => setStartHour(index)}
                >
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          to
          <Select
            value={endHour?.toString()}
            onValueChange={(val) => setEndHour(parseInt(val))}
          >
            <SelectTrigger className="w-full text-md outline-none">
              <SelectValue placeholder="Ends at" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour, index) => (
                <SelectItem
                  value={index.toString()}
                  onClick={() => setEndHour(index)}
                  disabled={index < startHour!}
                >
                  {hour.replace(":00", ":59")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      <Input
        placeholder="Event name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <Textarea
        placeholder="Event description..."
        className="w-full h-32 mb-8"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button className="font-bold w-full" onClick={handleEdit}>
        Save
        <Check className="pl-2" />
      </Button>
    </DialogContent>
  );
};

export default EditEvent;
