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
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/apiHandler";

const TodoList = ({
  currentDate,
  setOpen,
}: {
  currentDate: Date;
  setOpen: any;
}) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(currentDate);
  const [taskName, setTaskName] = useState<string>("");

  async function handleCreateTask() {
    if (taskName) {
      let newTask = {
        id: uuidv4(),
        name: taskName,
        date: date?.toISOString().split("T")[0],
        completed: false,
      };
      const raw = await apiHandler(
        "/createTask",
        "POST",
        "application/json",
        JSON.stringify(newTask)
      );

      if (!raw.ok) {
        toast.error("Error creating task");
        return;
      }

      setTasks([...tasks, newTask]);
      setTaskName("");
      setOpen(false);
      toast.success("Task created successfully!", {
        autoClose: 2100,
      });
    }
  }

  async function handleUpdateTask(task: any) {
    const raw = await apiHandler(
      "/updateTask",
      "POST",
      "application/json",
      JSON.stringify({
        id: task.id,
        completed: !task.completed,
      })
    );

    if (!raw.ok) {
      toast.error("Error updating task");
      return;
    }

    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) {
          if (!t.completed) {
            toast.success("Task completed!", {
              autoClose: 1900,
            });
          }
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  }

  async function handleDeleteTask(taskId: string) {
    let confirm = window.confirm("Are you sure you want to delete this task?");
    if (!confirm) {
      return;
    }

    const raw = await apiHandler(
      "/deleteTask",
      "POST",
      "application/json",
      JSON.stringify({
        id: taskId,
      })
    );
    if (!raw.ok) {
      toast.error("Error deteting task");
      return;
    }

    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully!", {
      autoClose: 1900,
    });
  }

  useEffect(() => {
    (async () => {
      const raw = await apiHandler(
        `/getTasks?date=${date?.toISOString().split("T")[0]}`,
        "GET",
        "application/json"
      );
      if (raw.ok) {
        raw.json().then((data) => {
          setTasks(data || []);
        });
      }
    })();
  }, [date]);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  return (
    <div className="list">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-bold text-2xl">
            Create a task
          </DialogTitle>
        </DialogHeader>
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
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
            />
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Task name"
          onChange={(e) => setTaskName(e.target.value)}
          className="mb-4 w-full"
        />

        <Button className="font-bold w-full" onClick={handleCreateTask}>
          Done
          <Check className="pl-2" />
        </Button>
      </DialogContent>
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={cn(
            `flex cursor-pointer w-100 relative items-center px-2 py-3 rounded-sm border-b-2 ${
              task.completed ? "bg-gray-200" : "bg-white"
            }}`,
            task.completed ? "opaqueTaskContainer" : "taskContainer"
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <Checkbox
            checked={task.completed}
            onClick={() => handleUpdateTask(task)}
            id={task.id}
            name={`task${task.id}}`}
            className="w-6 h-6 mr-4"
          />
          <Label
            htmlFor={`task${task.id}}`}
            className="text-xl font-regular w-full mr-8"
          >
            {task.name}
          </Label>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="absolute right-2 w-5 h-5 rounded-sm deleteButton"
          >
            <X
              className="w-full h-full"
              stroke="#c80004"
              strokeWidth={2.5}
              size={22}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
