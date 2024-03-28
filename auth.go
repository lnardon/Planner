package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("secret_key") // Change this for a environment variable before release

type Request struct {
	Username    string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// var (
//   host     = os.Getenv("DB_HOST")
//   port,_     = strconv.Atoi(os.Getenv("DB_PORT"))
//   user     = os.Getenv("POSTGRES_USER")
//   password = os.Getenv("POSTGRES_PASSWORD")
//   dbname   = os.Getenv("POSTGRES_DB")
// )

const (
  host     = "localhost"
  port     = 5432
  user     = "planner_db"
  password = "posty_passy"
  dbname   = "planner_db"
)

var connectionString = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

func handleLogin(w http.ResponseWriter, r *http.Request) {
    var login Request
    err := json.NewDecoder(r.Body).Decode(&login)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    defer r.Body.Close()
  
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        panic(err)
    }
    defer db.Close()
    
    statement, err := db.Prepare("SELECT username, password FROM users WHERE username = $1")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    var username, hashedPassword string
    err = statement.QueryRow(login.Username).Scan(&username, &hashedPassword)
    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Invalid username or password", http.StatusUnauthorized)
        } else {
            log.Fatal(err)
        }
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(login.Password)); err != nil {
        http.Error(w, "Invalid username or password", http.StatusUnauthorized)
        return
    }

    expirationTime := time.Now().Add(120 * time.Minute)
    claims := &Claims{
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(tokenString)
}


func handleRegister(w http.ResponseWriter, r *http.Request) {
	var register Request
	err := json.NewDecoder(r.Body).Decode(&register)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
  
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        panic(err)
    }

    defer db.Close()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(register.Password), 16)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id := uuid.New().String()
	sqlStatement := `
	INSERT INTO users (id, username, password)
	VALUES ($1, $2, $3)
	`
	err = db.QueryRow(sqlStatement, id, register.Username, hashedPassword).Scan()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func verifyJWT(endpointHandler http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Header["Authorization"] != nil {
            token, err := jwt.Parse(r.Header["Authorization"][0], func(token *jwt.Token) (interface{}, error) {
                if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                    return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
                }
                return jwtKey, nil
            })

            if err != nil {
                http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
                return
            }

            if token.Valid {
                endpointHandler(w, r)
            } else {
                http.Error(w, "Unauthorized: Invalid Token", http.StatusUnauthorized)
            }
        } else {
            http.Error(w, "Unauthorized: No Token in Request", http.StatusUnauthorized)
        }
    }
}

func handleHasUserRegistered(w http.ResponseWriter, r *http.Request) {  
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        panic(err)
    }

    defer db.Close()

	count := 0
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
        fmt.Print(err)
		return
	}

	if count == 0 {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(false)
	} else {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(true)
	}
}

func handleIsTokenValid(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
}

type Settings struct {
    RangeStart string `json:"startHour"`
    RangeEnd string `json:"endHour"`
}

func handleSettings(w http.ResponseWriter, r *http.Request) {
    var settings Settings
	err := json.NewDecoder(r.Body).Decode(&settings)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

    statement, err := db.Prepare("UPDATE users SET range_start = $1, range_end = $2 WHERE username = $3")
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    w.WriteHeader(http.StatusOK)
}