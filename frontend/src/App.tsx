import "./App.css";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

function App() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <>
      <h1 className="text-4xl font-bold underline">Planner</h1>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </>
  );
}

export default App;
