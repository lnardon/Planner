import { useState } from "react";
import Header from "../../components/Header";
import AnimatedText from "../../components/AnimatedText";
import { Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Timesheet from "../../components/Timesheet";
import TodoList from "../../components/TodoList";

const Dashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>("timesheet");
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(new Date().toLocaleDateString())
  );

  return (
    <>
      <Header />
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="main">
          <div className="sidebar">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(val) =>
                setCurrentDate(new Date(val || new Date().toLocaleDateString()))
              }
              className="rounded-md border-2 border-white border-opacity-60"
            />
            <div className="w-full border-2 rounded-md border-white border-opacity-60 box-content">
              <Select
                onValueChange={(val) => setCurrentView(val)}
                defaultValue={currentView}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent className="rounded-none rounded-b-md border-white border-opacity-60 bg-[#030609]">
                  <SelectItem
                    value="todo"
                    className="cursor-pointer transition-all"
                  >
                    Todo List
                  </SelectItem>
                  <SelectItem
                    value="timesheet"
                    className="cursor-pointer transition-all"
                  >
                    Timesheet
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="content">
            <div className="flex justify-between">
              <div className="text-4xl">
                <AnimatedText
                  text={currentDate
                    ?.toDateString()
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                />
              </div>
              <DialogTrigger className="w-24 animate-fade-in overflow-hidden">
                <Button className="font-bold w-full">
                  Create <Plus className="ml-1 h-4 w-4" />
                </Button>
              </DialogTrigger>
            </div>
            {currentView === "timesheet" ? (
              <Timesheet currentDate={currentDate} setOpen={setOpen} />
            ) : (
              <>
                <Separator />
                <TodoList currentDate={currentDate} setOpen={setOpen} />
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Dashboard;
