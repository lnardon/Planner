package main

import (
	"fmt"
	"net/http"
)

func main () {
    http.Handle("/", http.FileServer(http.Dir("./frontend/dist")))
    
    err := http.ListenAndServe(":8080",nil)
    if err != nil {
        fmt.Print("ERROR STARTING SERVER")
        return
    }

    fmt.Println("Server started on :8080")
}