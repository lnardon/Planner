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
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Date string `json:"date"`
    Status string `json:"status"`
}

type UpdateStatusRequest struct {
    ID          int    `json:"id"`
    Status string `json:"status"`
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

    statement, err := db.Prepare("INSERT INTO tasks (name, date, status) VALUES (?, ?, ?)")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(newTask.Name, newTask.Date, "pending")
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

    rows, err := db.Query("SELECT id, name, status, date FROM tasks WHERE date = ?", date)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var tasks []Task
    for rows.Next() {
        var task Task
        err := rows.Scan(&task.ID, &task.Name, &task.Status, &task.Date)
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

    statement, err := db.Prepare("UPDATE tasks SET status = ? WHERE id = ?")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(updatedTask.Status, updatedTask.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}


func main () {
    http.Handle("/", http.FileServer(http.Dir("./frontend/dist")))
    http.HandleFunc("/getTasks", handleGetTasksByDate)
    http.HandleFunc("/createTask", handleCreateTask)
    http.HandleFunc("/updateTask", handleUpdateTaskStatus)
    
    err := http.ListenAndServe(":8080",nil)
    if err != nil {
        fmt.Print("ERROR STARTING SERVER")
        return
    }

    fmt.Println("Server started on :8080")
}