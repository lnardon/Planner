import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { v4 as uuidv4 } from "uuid";

const TodoList = ({ currentDate }: { currentDate: Date | undefined }) => {
  const [tasks, setTasks] = useState<any[]>([]);
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
          id: uuidv4(),
          name: taskName,
          date: date?.toISOString().split("T")[0],
          completed: false,
        }),
      });

      console.log(res);

      if (!res.ok) {
        alert("Error creating task");
      }

      window.location.reload();
    }
  }

  async function handleUpdateTask(task: any) {
    const res = await fetch("/updateTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
      }),
    });

    if (!res.ok) {
      alert("Error updating task");
    }

    window.location.reload();
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
  }, [currentDate]);

  return (
    <div className="list">
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
          Done
          <Check className="pl-2" />
        </Button>
      </DialogContent>
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={cn(
            "flex cursor-pointer w-100 relative items-center px-2 py-3 rounded-sm border-b-2",
            task.completed ? "opaqueTaskContainer" : "taskContainer"
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <Checkbox
            checked={task.completed}
            onClick={() => handleUpdateTask(task)}
            id={task.id}
            name={`task${task.id}}`}
            className="w-6 h-6 mr-2"
          />
          <Label htmlFor={`task${task.id}}`} className="text-xl font-regular">
            {task.name}
          </Label>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="absolute right-2 w-5 h-5 rounded-sm deleteButton"
          >
            <X className="w-full h-full" stroke="#c80004" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
