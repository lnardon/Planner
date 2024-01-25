import "./App.css";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  async function handleCreateTask() {
    const task = prompt("Enter task name");
    if (task) {
      const res = await fetch("/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: task,
          date: date?.toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        alert("Error creating task");
      }
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

  useEffect(() => {
    fetch(`/getTasks?date=${date?.toISOString().split("T")[0]}`, {}).then(
      (res) => {
        if (res.ok) {
          res.json().then((data) => {
            setTasks(data || []);
          });
        }
      }
    );

    // setTasks([
    //   {
    //     id: "1",
    //     name: "Task 1",
    //     status: "pending",
    //   },
    // ]);
  }, [date]);

  return (
    <div className="app">
      <div className="sidebar">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <Button onClick={handleCreateTask} className="font-bold">
          Add task
        </Button>
      </div>
      <div className="content">
        <h1 className="text-4xl font-bold">{date?.toDateString()}</h1>
        <Separator />
        <div className="list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center cursor-pointer mb-2"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
