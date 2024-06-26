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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { apiHandler } from "@/utils/apiHandler";

const CreateEvent = ({
  setOpen,
  setEvents,
  events,
  hours,
  initialStart,
  initialEnd,
  currentDate,
}: {
  setOpen: any;
  setEvents: any;
  events: any;
  hours: string[];
  initialStart: number;
  initialEnd: number;
  currentDate: Date;
}) => {
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [frequency, setFrequency] = useState<string>("Once");
  const [startHour, setStartHour] = useState<number>(initialStart);
  const [endHour, setEndHour] = useState<number>(initialEnd);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);

  const Frequency = ["Once", "Daily", "Weekly", "Monthly"];

  async function handleCreateEvent() {
    if (startHour !== null && endHour !== null && name) {
      let newEvent = {
        id: uuidv4(),
        date: date?.toISOString().split("T")[0],
        start: startHour,
        end: endHour,
        name,
        description: description,
        frequency: frequency.toLowerCase(),
        amount,
      };
      let raw = await apiHandler(
        "/createEvent",
        "POST",
        "application/json",
        JSON.stringify(newEvent)
      );
      if (!raw.ok) {
        toast.error("Error creating event");
        return;
      }

      setOpen(false);
      setStartHour(0);
      setEndHour(0);
      setName("");
      setDescription("");
      setAmount(2);
      setFrequency("Once");
      setEvents([...events, newEvent]);
      toast.success("Event created successfully!", {
        autoClose: 2300,
      });
    }
  }

  useEffect(() => {
    setStartHour(initialStart);
    setEndHour(initialEnd);
  }, [initialStart, initialEnd]);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  return (
    <DialogContent className="bg-green-600">
      <DialogHeader className="mb-0">
        <DialogTitle className="text-white font-bold text-2xl text-start">
          Create event
        </DialogTitle>
      </DialogHeader>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-slate-950 text-white",
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
              setEndHour(parseInt(val));
            }}
          >
            <SelectTrigger className="w-full text-md outline-none bg-slate-950 text-white">
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
          <strong className="font-bold text-black">to</strong>
          <Select
            value={endHour?.toString()}
            onValueChange={(val) => setEndHour(parseInt(val))}
          >
            <SelectTrigger className="w-full text-md outline-none bg-slate-950 text-white">
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
      <div>
        <Select
          value={frequency}
          onValueChange={(val) => {
            setFrequency(val);
          }}
        >
          <SelectTrigger className="w-full text-md outline-none bg-slate-950 text-white">
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
        {frequency !== "Once" && (
          <Input
            type="number"
            placeholder="Repeat event X times"
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="mt-4 w-full bg-slate-950 text-white"
          />
        )}
      </div>
      <Input
        placeholder="Event name"
        onChange={(e) => setName(e.target.value)}
        className="bg-slate-950 text-white"
      />
      <Textarea
        placeholder="Event description..."
        className="w-full h-44 mb-4 bg-slate-950 text-white"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        className="font-bold w-full bg-white text-black hover:bg-gray-100 hover:shadow-lg"
        onClick={handleCreateEvent}
      >
        Create
        <Check className="pl-2" />
      </Button>
    </DialogContent>
  );
};

export default CreateEvent;
