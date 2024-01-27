import "./App.css";
import Header from "./components/Header";
import AnimatedText from "./components/AnimatedText";
import { Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "./lib/utils";
import { Input } from "./components/ui/input";

function App() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [taskName, setTaskName] = useState<string>("");

  async function handleCreateTask() {
    if (taskName) {
      const res = await fetch("/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: taskName,
          date: date?.toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        alert("Error creating task");
      }

      window.location.reload();
    }
  }

  async function handleUpdateTask(taskId: string) {
    const res = await fetch("/updateTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: taskId,
        status: "completed",
      }),
    });

    if (!res.ok) {
      alert("Error updating task");
    }

    setTasks((tasks) => {
      return tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: "completed",
          };
        }
        return task;
      });
    });
  }

  async function handleDeleteTask(taskId: string) {
    const res = await fetch("/deleteTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: taskId,
      }),
    });

    if (!res.ok) {
      alert("Error deleting task");
    }

    window.location.reload();
  }

  useEffect(() => {
    fetch(
      `/getTasks?date=${currentDate?.toISOString().split("T")[0]}`,
      {}
    ).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setTasks(data || []);
        });
      }
    });

    // setTasks([
    //   {
    //     id: "1",
    //     name: "Task 1",
    //     status: "pending",
    //   },
    // ]);
  }, [currentDate]);

  return (
    <div className="app">
      <Header />
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-bold text-2xl">
              Create a task
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Task name"
            onChange={(e) => setTaskName(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mb-4",
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

          <Button className="font-bold w-full" onClick={handleCreateTask}>
            Create
          </Button>
        </DialogContent>

        <div className="main">
          <div className="sidebar">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={setCurrentDate}
              className="rounded-md border"
            />
            <DialogTrigger className="w-full">
              <Button className="font-bold w-full">
                <Plus className="mr-2 h-4 w-4" /> Add task
              </Button>
            </DialogTrigger>
          </div>
          <div className="content">
            <AnimatedText
              text={currentDate?.toDateString().split(" ").slice(1).join(" ")}
            />
            <Separator className="separator" />
            <div className="list">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex cursor-pointer w-100 relative items-center px-2 py-2 rounded-md",
                    task.status === "completed"
                      ? "opaqueTaskContainer"
                      : "taskContainer"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Checkbox
                    checked={task.status === "completed"}
                    onClick={() => handleUpdateTask(task.id)}
                    id={task.id}
                    name={`task${task.id}}`}
                    className="w-6 h-6 mr-2"
                  />
                  <Label
                    htmlFor={`task${task.id}}`}
                    className="text-xl font-medium"
                  >
                    {task.name}
                  </Label>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="absolute right-2 w-6 h-6 rounded-sm deleteButton"
                  >
                    <X className="w-full h-full" stroke="#c80004" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default App;
