import { useState } from "react";
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
import { v4 as uuidv4 } from "uuid";

const CreateEvent = ({
  setOpen,
  setEvents,
  events,
  hours,
}: {
  setOpen: any;
  setEvents: any;
  events: any;
  hours: string[];
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [frequency, setFrequency] = useState<string>("Once");
  const [startHour, setStartHour] = useState<number | null>(0);
  const [endHour, setEndHour] = useState<number | null>(1);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const Frequency = ["Once", "Daily", "Weekly", "Monthly"];

  function handleCreateEvent() {
    if (startHour !== null && endHour !== null && name) {
      let newEvent = {
        id: uuidv4(),
        date: date?.toISOString().split("T")[0],
        start: startHour,
        end: endHour,
        name,
        description: description,
        frequency: frequency.toLowerCase(),
      };
      fetch("/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newEvent),
      }).then((res) => {
        if (!res.ok) {
          toast.error("Error creating event");
          return;
        }

        setOpen(false);
        setStartHour(0);
        setEndHour(null);
        setName("");
        setDescription("");
        setFrequency("Once");
        setEvents([...events, newEvent]);
        toast.success("Event created successfully!");
      });
    }
  }

  return (
    <DialogContent>
      <DialogHeader className="mb-0">
        <DialogTitle className="text-bold text-2xl text-start">
          Create event
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
            value={startHour?.toString() || "0"}
            onValueChange={(val) => {
              setStartHour(parseInt(val));
              setEndHour(parseInt(val));
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
            value={endHour?.toString() || "0"}
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
      <Select
        value={frequency}
        onValueChange={(val) => {
          setFrequency(val);
        }}
      >
        <SelectTrigger className="w-full text-md outline-none">
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent>
          {Frequency.map((freq, index) => (
            <SelectItem
              key={index + freq}
              value={freq}
              onClick={() => setFrequency(freq)}
            >
              {freq}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Event name"
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        placeholder="Event description..."
        className="w-full h-32 mb-8"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button className="font-bold w-full" onClick={handleCreateEvent}>
        Done
        <Check className="pl-2" />
      </Button>
    </DialogContent>
  );
};

export default CreateEvent;
