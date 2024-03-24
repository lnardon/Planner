CREATE TABLE Tasks (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL
);

CREATE TABLE Events (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    date TEXT NOT NULL
);

CREATE TABLE Users (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);