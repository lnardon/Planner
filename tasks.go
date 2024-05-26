package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Task struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Date      string `json:"date"`
	Completed bool   `json:"completed"`
}

type UpdateStatusRequest struct {
	ID        string `json:"id"`
	Completed bool   `json:"completed"`
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
    var newTask Task
    err := json.NewDecoder(r.Body).Decode(&newTask)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()

    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    user_id, err := GetIDFromJWT(r.Header["Authorization"][0])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

    statement, err := db.Prepare(`INSERT INTO "Tasks" (user_id, id, name, date, completed) VALUES ($1, $2, $3, $4, $5)`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(user_id, newTask.ID, newTask.Name, newTask.Date, 0)
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

    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query(`SELECT id, name, completed, date FROM "Tasks" WHERE date = $1`, date)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    tasks := make([]Task, 0)
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

    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    statement, err := db.Prepare(`UPDATE "Tasks" SET completed = $1 WHERE id = $2`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

	convertedCompleted := 0
	if updatedTask.Completed {
		convertedCompleted = 1
	}

    _, err = statement.Exec(convertedCompleted, updatedTask.ID)
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

    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

	statement, err := db.Prepare(`DELETE FROM "Tasks" WHERE id = $1`)
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