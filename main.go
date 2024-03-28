package main

import (
	"fmt"
	"net/http"
)

func main () {
    http.Handle("/", http.FileServer(http.Dir("./frontend/dist")))
    http.HandleFunc("/login", handleLogin)
    http.HandleFunc("/register", handleRegister)
    http.HandleFunc("/hasUserRegistered", handleHasUserRegistered)
    http.HandleFunc("/isTokenValid", verifyJWT(handleIsTokenValid))
    http.HandleFunc("/setSettings", verifyJWT(handleSettings))

    http.HandleFunc("/getTasks", verifyJWT(handleGetTasksByDate))
    http.HandleFunc("/createTask", verifyJWT(handleCreateTask))
    http.HandleFunc("/updateTask", verifyJWT(handleUpdateTaskStatus))
    http.HandleFunc("/deleteTask", verifyJWT(handleDeleteTask))

    http.HandleFunc("/getEvents", verifyJWT(handleGetEventsByDate))
    http.HandleFunc("/createEvent", verifyJWT(handleCreateEvent))
    http.HandleFunc("/deleteEvent", verifyJWT(handleDeleteEvent))
    
    port := ":8080"
    err := http.ListenAndServe(port,nil)
    if err != nil {
        fmt.Print("ERROR STARTING SERVER on port", port)
        return
    }

    fmt.Println("Server started on port", port)           
}
