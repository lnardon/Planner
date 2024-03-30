package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Settings struct {
    RangeStart int `json:"startHour"`
    RangeEnd int `json:"endHour"`
}

func handleSettings(w http.ResponseWriter, r *http.Request) {
    var settings Settings
	err := json.NewDecoder(r.Body).Decode(&settings)
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

    statement, err := db.Prepare(`
        UPDATE "Settings" s
        SET range_start = $1, range_end = $2
        FROM "Users" u
        WHERE u.settings_id = s.id AND u.id = $3`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    id, err := GetIDFromJWT(r.Header["Authorization"][0])
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    _, err = statement.Exec(settings.RangeStart, settings.RangeEnd, id)

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}