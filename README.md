# Planner

Planner is a Dockerized web application designed to help you efficiently organize your daily tasks and events. With features like a daily todo list and a comprehensive time sheet view, Planner enables you to outline your day's tasks and schedule events with ease.

<img src="./demo.gif" style="width: 100%"/>

</br>

## Quick Installation with Docker compose (Planner server + Postgres database)

```yml
version: "3.9"

services:
  db:
    container_name: planner_db
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: posty_passy # Change this to a more secure password
      POSTGRES_USER: planner_db # Change this to a more secure username
      POSTGRES_DB: planner_db
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - planner_network
    command: >
      /bin/bash -c "
      printf \"CREATE TABLE \\\"Settings\\\"(
        \\\"id\\\" UUID NOT NULL UNIQUE,
        \\\"range_start\\\" INT NOT NULL,
        \\\"range_end\\\" INT NOT NULL,
        \\\"disable_notifications\\\" BOOLEAN NOT NULL,
        PRIMARY KEY(\\\"id\\\")
      );
      CREATE TABLE \\\"Tasks\\\"(
        \\\"id\\\" UUID NOT NULL UNIQUE,
        \\\"name\\\" TEXT NOT NULL,
        \\\"date\\\" DATE NOT NULL,
        \\\"completed\\\" BOOLEAN NOT NULL,
        \\\"user_id\\\" UUID NOT NULL,
        PRIMARY KEY(\\\"id\\\")
      );
      CREATE TABLE \\\"Events\\\"(
        \\\"id\\\" UUID NOT NULL UNIQUE,
        \\\"name\\\" VARCHAR(255) NOT NULL,
        \\\"description\\\" TEXT,
        \\\"start_time\\\" INT NOT NULL,
        \\\"end_time\\\" INT NOT NULL,
        \\\"date\\\" DATE NOT NULL,
        \\\"user_id\\\" UUID NOT NULL,
        PRIMARY KEY(\\\"id\\\")
      );
      CREATE TABLE \\\"Users\\\"(
        \\\"id\\\" UUID NOT NULL UNIQUE,
        \\\"username\\\" VARCHAR(255) NOT NULL UNIQUE,
        \\\"password\\\" VARCHAR(255) NOT NULL,
        \\\"settings_id\\\" UUID,
        PRIMARY KEY(\\\"id\\\")
      );
      ALTER TABLE \\\"Tasks\\\" ADD CONSTRAINT \\\"user_id_fk\\\" FOREIGN KEY(\\\"user_id\\\") REFERENCES \\\"Users\\\"(\\\"id\\\");
      ALTER TABLE \\\"Users\\\" ADD CONSTRAINT \\\"settings_id_fk\\\" FOREIGN KEY(\\\"settings_id\\\") REFERENCES \\\"Settings\\\"(\\\"id\\\");
      ALTER TABLE \\\"Events\\\" ADD CONSTRAINT \\\"user_id_fk\\\" FOREIGN KEY(\\\"user_id\\\") REFERENCES \\\"Users\\\"(\\\"id\\\");
      \" > /docker-entrypoint-initdb.d/init.sql;
      docker-entrypoint.sh postgres
      "

  planner_server:
    container_name: planner_server
    image: lnardon/planner
    restart: always
    ports:
      - "8080:8080"
    networks:
      - planner_network
    depends_on:
      - db
    environment:
      POSTGRES_PASSWORD: posty_passy # Change this to your password
      POSTGRES_USER: planner_db # Change this to your username
      POSTGRES_DB: planner_db
      DB_PORT: 5432
      DB_HOST: db
      JWT_SECRET: d7b31cf75011920a7b1fed033b93 # Change this to your JWT secret key

networks:
  planner_network:
    driver: bridge
```

### Build and deploy from source code

Clone, build and run the application with the command below:

```bash
git clone https://github.com/lnardon/Planner.git && cd Planner && docker-compose up
```
