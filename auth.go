package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET")) // For some reason the jwtKey needs to be converted to a byte array even though the "SignedString" function takes a string

type Request struct {
	Username    string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
    ID string `json:"id"`
	jwt.RegisteredClaims
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
    var login Request
    err := json.NewDecoder(r.Body).Decode(&login)
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
    
    statement, err := db.Prepare(`SELECT id, username, password FROM "Users" WHERE username = $1`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    var id, username, hashedPassword string
    err = statement.QueryRow(login.Username).Scan(&id, &username, &hashedPassword)
    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Invalid username or password", http.StatusUnauthorized)
        } else {
            log.Fatal(err)
        }
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(login.Password)); err != nil {
        http.Error(w, "Invalid username or password", http.StatusNotFound)
        return
    }

    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        Username: username,
        ID:       id,
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

    statement, err = db.Prepare(`
        SELECT s.range_start, s.range_end, s.disable_notifications 
        FROM "Settings" s
        JOIN "Users" u ON u.settings_id = s.id
        WHERE u.id = $1`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    var rangeStart, rangeEnd int
    var disableNotifications bool
    err = statement.QueryRow(id).Scan(&rangeStart, &rangeEnd, &disableNotifications)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"token": tokenString, "rangeStart": strconv.Itoa(rangeStart), "rangeEnd": strconv.Itoa(rangeEnd), "disableNotifications": strconv.FormatBool(disableNotifications)})
}


func handleRegister(w http.ResponseWriter, r *http.Request) {
	var register Request
	err := json.NewDecoder(r.Body).Decode(&register)
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

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(register.Password), 16)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id := uuid.New().String()
    settings_id := uuid.New().String()
    statement, err := db.Prepare(`INSERT INTO "Settings" (id, range_start, range_end, disable_notifications) VALUES ($1, $2, $3, $4)`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(settings_id, 0, 23, false)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    statement, err = db.Prepare(`INSERT INTO "Users" (id, username, password, settings_id) VALUES ($1, $2, $3, $4)`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(id, register.Username, hashedPassword, settings_id)
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

func GetIDFromJWT(tokenString string) (string, error) {
    token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
    if err != nil {
        return "", err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok {
        if id, ok := claims["id"].(string); ok {
            return id, nil
        }
        return "", fmt.Errorf("id claim not found")
    }
    return "", fmt.Errorf("invalid token claims")
}

func handleHasUserRegistered(w http.ResponseWriter, r *http.Request) {  
    db, err := getDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

	count := 0
	err = db.QueryRow(`SELECT COUNT(*) FROM "Users"`).Scan(&count)
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

func handleChangePassword(w http.ResponseWriter, r *http.Request) {
    var changePassword Request
    err := json.NewDecoder(r.Body).Decode(&changePassword)
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

    id, err := GetIDFromJWT(r.Header["Authorization"][0])
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(changePassword.Password), 16)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    statement, err := db.Prepare(`UPDATE "Users" SET password = $1 WHERE id = $2`)
    if err != nil {
        log.Fatal(err)
    }
    defer statement.Close()

    _, err = statement.Exec(hashedPassword, id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}