package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Event struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Date        string `json:"date"`
	Description string `json:"description"`
	Start       int    `json:"start"`
	End         int    `json:"end"`
	Frequency   string `json:"frequency"`
}

func handleGetEventsByDate(w http.ResponseWriter, r *http.Request) {
	//EXPECTED FORMAT: "?date=2024-01-24"
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

	rows, err := db.Query(`SELECT id, name, description, date, start_time, end_time FROM "Events" WHERE date = $1`, date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	events := make([]Event, 0)
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

    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

	baseDate, err := time.Parse("2006-01-02", newEvent.Date)
	if err != nil {
		log.Fatal("Error parsing base date:", err)
	}

	queryString := `INSERT INTO "Events" (id, name, description, date, start_time, end_time, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	user_id, err := GetIDFromJWT(r.Header["Authorization"][0])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	switch newEvent.Frequency {
	case "once":
		_, err := db.Exec(queryString, newEvent.ID, newEvent.Name, newEvent.Description, newEvent.Date, newEvent.Start, newEvent.End,user_id)
		if err != nil {
			log.Fatal(err)
		}

	case "daily":
		for i := 0; i < 7; i++ {
			eventDate := baseDate.AddDate(0, 0, i).Format("2006-01-02")
			uuid, err := uuid.NewRandom()
			if err != nil {
				log.Fatal(err)
			}
			_, err = db.Exec(queryString, uuid, newEvent.Name, newEvent.Description, eventDate, newEvent.Start, newEvent.End,user_id)
			if err != nil {
				log.Fatal(err)
			}
		}

	case "weekly":
		for i := 0; i < 4; i++ {
			eventDate := baseDate.AddDate(0, 0, i*7).Format("2006-01-02")
			uuid, err := uuid.NewRandom()
			if err != nil {
				log.Fatal(err)
			}
			_, err = db.Exec(queryString, uuid, newEvent.Name, newEvent.Description, eventDate, newEvent.Start, newEvent.End,user_id)
			if err != nil {
				log.Fatal(err)
			}
		}

	case "monthly":
		for i := 0; i < 12; i++ {
			eventDate := baseDate.AddDate(0, i, 0).Format("2006-01-02")
			uuid, err := uuid.NewRandom()
			if err != nil {
				log.Fatal(err)
			}
			_, err = db.Exec(queryString, uuid, newEvent.Name, newEvent.Description, eventDate, newEvent.Start, newEvent.End,user_id)
			if err != nil {
				log.Fatal(err)
			}
		}

	default:
		fmt.Println("Invalid frequency:", newEvent.Frequency)
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newEvent)
}

func handleDeleteEvent(w http.ResponseWriter, r *http.Request) {
	var updatedEvent Event
	err := json.NewDecoder(r.Body).Decode(&updatedEvent)
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

	statement, err := db.Prepare(`DELETE FROM "Events" WHERE id = $1`)
	if err != nil {
		log.Fatal(err)
	}
	defer statement.Close()

	_, err = statement.Exec(updatedEvent.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}