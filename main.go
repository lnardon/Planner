package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type Task struct {
    ID          string  `json:"id"`
    Name        string  `json:"name"`
    Date        string  `json:"date"`
    Completed   bool    `json:"completed"`
}

type UpdateStatusRequest struct {
    ID          string  `json:"id"`
    Completed   bool  `json:"completed"`
}

type Event struct {
    ID          string  `json:"id"`
    Name        string  `json:"name"`
    Date        string  `json:"date"`
    Description string  `json:"description"`
    Start       int     `json:"start"`
    End         int     `json:"end"`
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
    var newTask Task
    err := json.NewDecoder(r.Body).Decode(&newTask)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    statement, err := db.Prepare("INSERT INTO tasks (id, name, date, completed) VALUES (?, ?, ?, ?)")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(newTask.ID, newTask.Name, newTask.Date, newTask.Completed)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(newTask)
}

func handleGetTasksByDate(w http.ResponseWriter, r *http.Request) {
    //EXPECTED FORMAT: "/tasks?date=2024-01-24"
    date := r.URL.Query().Get("date")
    if date == "" {
        http.Error(w, "Date is required", http.StatusBadRequest)
        return
    }

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, name, completed, date FROM tasks WHERE date = ?", date)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    tasks := make([]Task, 0);
    for rows.Next() {
        var task Task
        err := rows.Scan(&task.ID, &task.Name, &task.Completed, &task.Date)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        tasks = append(tasks, task)
    }

    if err = rows.Err(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tasks)
}

func handleUpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
    var updatedTask UpdateStatusRequest
    err := json.NewDecoder(r.Body).Decode(&updatedTask)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    statement, err := db.Prepare("UPDATE tasks SET completed = ? WHERE id = ?")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(updatedTask.Completed, updatedTask.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}

func handleDeleteTask(w http.ResponseWriter, r *http.Request) {
    var updatedTask UpdateStatusRequest
    err := json.NewDecoder(r.Body).Decode(&updatedTask)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    statement, err := db.Prepare("DELETE FROM tasks WHERE id = ?")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(updatedTask.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}

func handleGetEventsByDate(w http.ResponseWriter, r *http.Request) {
    //EXPECTED FORMAT: "/...?date=2024-01-24"
    date := r.URL.Query().Get("date")
    if date == "" {
        http.Error(w, "Date is required", http.StatusBadRequest)
        return
    }

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, name, description, date, start, end FROM events WHERE date = ?", date)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    events := make([]Event, 0);
    for rows.Next() {
        var event Event
        err := rows.Scan(&event.ID, &event.Name, &event.Description, &event.Date, &event.Start, &event.End)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        events = append(events, event)
    }

    if err = rows.Err(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(events)
}

func handleCreateEvent(w http.ResponseWriter, r *http.Request) {
    var newEvent Event
    err := json.NewDecoder(r.Body).Decode(&newEvent)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    db, err := sql.Open("sqlite3", "./database.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    statement, err := db.Prepare("INSERT INTO events (id, name, description, date, start, end) VALUES (?, ?, ?, ?, ?, ?)")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(newEvent.ID, newEvent.Name, newEvent.Description, newEvent.Date, newEvent.Start, newEvent.End)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(newEvent)
}

func main () {
    http.Handle("/", http.FileServer(http.Dir("./frontend/dist")))

    http.HandleFunc("/getTasks", handleGetTasksByDate)
    http.HandleFunc("/createTask", handleCreateTask)
    http.HandleFunc("/updateTask", handleUpdateTaskStatus)
    http.HandleFunc("/deleteTask", handleDeleteTask)

    http.HandleFunc("/getEvents", handleGetEventsByDate)
    http.HandleFunc("/createEvent", handleCreateEvent)
    
    err := http.ListenAndServe(":8080",nil)
    if err != nil {
        fmt.Print("ERROR STARTING SERVER")
        return
    }

    fmt.Println("Server started on :8080")
}