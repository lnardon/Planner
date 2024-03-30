CREATE TABLE "Settings"(
    "id" UUID NOT NULL,
    "range_start" INT NOT NULL,
    "range_end" INT NOT NULL,
    "disable_notifications" BOOLEAN NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Tasks"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "user_id" UUID NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Events"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start" INT NOT NULL,
    "end" INT NOT NULL,
    "date" DATE NOT NULL,
    "user_id" UUID NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "Users"(
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "settings_id" UUID,
    PRIMARY KEY("id")
);

ALTER TABLE "Tasks" ADD CONSTRAINT "tasks_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");

ALTER TABLE "Users" ADD CONSTRAINT "users_settings_id_foreign" FOREIGN KEY("settings_id") REFERENCES "Settings"("id");

ALTER TABLE "Events" ADD CONSTRAINT "events_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
