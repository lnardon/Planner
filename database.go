package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

var (
  host     = os.Getenv("DB_HOST")
  port,_     = strconv.Atoi(os.Getenv("DB_PORT"))
  user     = os.Getenv("POSTGRES_USER")
  password = os.Getenv("POSTGRES_PASSWORD")
  dbname   = os.Getenv("POSTGRES_DB")
)

// const (
//   host     = "localhost"
//   port     = 5432
//   user     = "planner_db"
//   password = "posty_passy"
//   dbname   = "planner_db"
// )

var connectionString = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

func getDB() (*sql.DB, error) {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal(err)
	}
	return db, err
}