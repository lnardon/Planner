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
    start INTEGER NOT NULL,
    end INTEGER NOT NULL,
    date TEXT NOT NULL
);
