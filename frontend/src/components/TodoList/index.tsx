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

const TodoList = ({
  currentDate,
  setOpen,
}: {
  currentDate: Date;
  setOpen: any;
}) => {
  const [tasks, setTasks] = useState([
    {
      id: uuidv4(),
      name: "New task",
      date: new Date(new Date().toLocaleDateString())
        .toISOString()
        .split("T")[0],
      completed: false,
    },
  ]);
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
      const res = await fetch("/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        toast.error("Error creating task", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }

      setTasks([...tasks, newTask]);
      setTaskName("");
      setOpen(false);
      toast.success("Task created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }

  async function handleUpdateTask(task: any) {
    const res = await fetch("/updateTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
      }),
    });

    if (!res.ok) {
      toast.error("Error updating task", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) {
          if (!t.completed) {
            toast.info("Task completed!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  }

  async function handleDeleteTask(taskId: string) {
    const res = await fetch("/deleteTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        id: taskId,
      }),
    });

    if (!res.ok) {
      toast.error("Error deteting task", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }

  useEffect(() => {
    fetch(`/getTasks?date=${date?.toISOString().split("T")[0]}`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setTasks(data || []);
        });
      }
    });
  }, [date]);

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
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
            />
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
            <X className="w-full h-full" stroke="#c80004" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
