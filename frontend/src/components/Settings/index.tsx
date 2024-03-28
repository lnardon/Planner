import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { apiHandler } from "@/utils/apiHandler";
import { toast } from "react-toastify";

interface Props {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
}

const Settings: React.FC<Props> = ({ isSettingsOpen, setIsSettingsOpen }) => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [startHour, setStartHour] = useState<number | null>(0);
  const [endHour, setEndHour] = useState<number | null>(23);

  async function handleSave() {
    let raw = await apiHandler(
      "/setSettings",
      "POST",
      "application/json",
      JSON.stringify({ startHour, endHour })
    );
    if (!raw.ok) {
      toast.error("Failed to save settings");
      return;
    }

    toast.success("Settings saved successfully");
    setIsSettingsOpen(false);
  }

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetContent>
        <SheetHeader className="mb-8">
          <SheetTitle className="text-4xl">Settings</SheetTitle>
        </SheetHeader>
        <h4 className="text-sm font-medium text-gray-400 mb-1">
          Select below the time range to be displayed in the calendar.
        </h4>
        <div className="flex items-center gap-4 py-4 mb-4">
          <Select
            value={startHour?.toString()}
            onValueChange={(val) => {
              setStartHour(parseInt(val));
            }}
          >
            <SelectTrigger className="w-full text-md outline-none border-2 border-gray-400">
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
          <span className="text-gray-300 font-medium">to</span>
          <Select
            value={endHour?.toString()}
            onValueChange={(val) => {
              setEndHour(parseInt(val));
            }}
          >
            <SelectTrigger className="w-full text-md outline-none border-2 border-gray-400">
              <SelectValue placeholder="Starts at" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour, index) => (
                <SelectItem
                  value={index.toString()}
                  onClick={() => setEndHour(index)}
                >
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
