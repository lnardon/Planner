import "./App.css";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
          task,
          date,
        }),
      });

      if (res.ok) {
        alert("Task created");
      } else {
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
        taskId,
        status: "completed",
      }),
    });

    if (res.ok) {
      alert("Task updated");
    } else {
      alert("Error updating task");
    }
  }

  useEffect(() => {
    fetch("/getTasks", {}).then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setTasks(data || []);
        });
      }
    });
  }, []);

  return (
    <div className="app">
      <div className="sidebar">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <Button onClick={handleCreateTask}>Add task</Button>
      </div>
      <div className="content">
        <h1 className="text-4xl font-bold underline">{date?.toDateString()}</h1>
        <div>
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center">
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={() => handleUpdateTask(task.id)}
              />
              <p className="ml-2">{task.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
