import "./App.css";
import Header from "./components/Header";
import AnimatedText from "./components/AnimatedText";
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

import { useState } from "react";
import Timesheet from "./components/Timesheet";
import TodoList from "./components/TodoList";

function App() {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>("timesheet");
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());

  return (
    <div className="app">
      <Header />
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="main">
          <div className="sidebar">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={setCurrentDate}
              className="rounded-md border"
            />
            <Select
              onValueChange={(val) => setCurrentView(val)}
              defaultValue={currentView}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo List</SelectItem>
                <SelectItem value="timesheet">Timesheet</SelectItem>
              </SelectContent>
            </Select>

            <DialogTrigger className="w-full">
              <Button className="font-bold w-full">
                Create <Plus className="ml-1 h-4 w-4" />
              </Button>
            </DialogTrigger>
          </div>
          <div className="content">
            <AnimatedText
              text={currentDate?.toDateString().split(" ").slice(1).join(" ")}
            />
            {currentView === "todo" && <Separator />}

            {currentView === "timesheet" ? (
              <Timesheet setOpen={setOpen} />
            ) : (
              <TodoList currentDate={currentDate} />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default App;
