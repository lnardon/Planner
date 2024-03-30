CREATE TABLE "Settings"(
    "id" UUID NOT NULL UNIQUE,
    "range_start" INT NOT NULL,
    "range_end" INT NOT NULL,
    "disable_notifications" BOOLEAN NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Tasks"(
    "id" UUID NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "user_id" UUID NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Events"(
    "id" UUID NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" INT NOT NULL,
    "end_time" INT NOT NULL,
    "date" DATE NOT NULL,
    "user_id" UUID NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Users"(
    "id" UUID NOT NULL UNIQUE,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "settings_id" UUID,
    PRIMARY KEY("id")
);

ALTER TABLE "Tasks" ADD CONSTRAINT "user_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");

ALTER TABLE "Users" ADD CONSTRAINT "settings_id" FOREIGN KEY("settings_id") REFERENCES "Settings"("id");

ALTER TABLE "Events" ADD CONSTRAINT "user_id" FOREIGN KEY("user_id") REFERENCES "Users"("id");
