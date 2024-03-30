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
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/utils/settingsStore";
import { Checkbox } from "../ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

interface Props {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
}

const Settings: React.FC<Props> = ({ isSettingsOpen, setIsSettingsOpen }) => {
  const storeRangeStart = useSettingsStore((state: any) => state.rangeStart);
  const storeRangeEnd = useSettingsStore((state: any) => state.rangeEnd);
  const setRangeStart = useSettingsStore((state: any) => state.setRangeStart);
  const setRangeEnd = useSettingsStore((state: any) => state.setRangeEnd);
  const setDisableNotifications = useSettingsStore(
    (state: any) => state.setDisableNotifications
  );
  const disableNotifications = useSettingsStore(
    (state: any) => state.disableNotifications
  );

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i % 12}:00 ${i < 12 ? "am" : "pm"}`
  );
  const [startHour, setStartHour] = useState<number | null>(storeRangeStart);
  const [endHour, setEndHour] = useState<number | null>(storeRangeEnd);
  const [notifications, setNotifications] = useState<boolean>(
    disableNotifications === "true"
  );

  async function handleSave() {
    let raw = await apiHandler(
      "/setSettings",
      "POST",
      "application/json",
      JSON.stringify({
        startHour: parseInt(startHour as any),
        endHour: parseInt(endHour as any),
        disableNotifications: notifications,
      })
    );
    if (!raw.ok) {
      toast.error("Failed to save settings");
      return;
    }

    toast.success("Settings saved successfully");
    setRangeStart(startHour);
    setRangeEnd(endHour);
    setDisableNotifications(notifications);
    setIsSettingsOpen(false);
  }

  const handleCheckedChange = (checked: CheckedState) => {
    if (checked === "indeterminate") {
    } else {
      setNotifications(checked);
    }
  };

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetContent>
        <SheetHeader className="mb-2">
          <SheetTitle className="text-4xl">Settings</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <h4 className="text-sm font-medium text-gray-400 mb-1">
          Select the time range to be displayed in the Timesheet.
        </h4>
        <div className="flex items-center gap-4 py-4 mb-2">
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
        <Separator className="my-4" />
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="notifications"
            className="w-5 h-5"
            checked={notifications}
            onCheckedChange={handleCheckedChange}
          />
          <label
            htmlFor="notifications"
            className="text-lg font-medium text-gray-300"
          >
            Disable notifications
          </label>
        </div>
        <Separator className="my-4" />
        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
