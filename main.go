package main

import (
	"fmt"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main () {
    http.Handle("/", http.FileServer(http.Dir("./frontend/dist")))

    http.HandleFunc("/getTasks", handleGetTasksByDate)
    http.HandleFunc("/createTask", handleCreateTask)
    http.HandleFunc("/updateTask", handleUpdateTaskStatus)
    http.HandleFunc("/deleteTask", handleDeleteTask)

    http.HandleFunc("/getEvents", handleGetEventsByDate)
    http.HandleFunc("/createEvent", handleCreateEvent)
    http.HandleFunc("/deleteEvent", handleDeleteEvent)
    
    port := ":8080"
    err := http.ListenAndServe(port,nil)
    if err != nil {
        fmt.Print("ERROR STARTING SERVER on Port", port, "\n")
        return
    }

    fmt.Println("Server started on :8080")
}