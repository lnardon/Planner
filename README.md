# Planner

Planner is a Dockerized web application designed to help you efficiently organize your daily tasks and events. With features like a daily todo list and a comprehensive time sheet view, Planner enables you to outline your day's tasks and schedule events with ease.

<img src="./demo.gif" style="width: 100%"/>

</br>

## How to use

### Get from Docker Hub

1 - Download and start the container from the Docker Hub image using the following command.

```bash
docker run -d -p 8080:8080 -v /planner/db:/db lnardon/planner
```

2 - Go to http://localhost:8080

### Build from source

1 - Clone the repository and build the Docker image:

```bash
git clone https://github.com/lnardon/Planner.git && cd Planner && docker build -t lnardon/planner .
```

2 - Start the container using the following command.

```bash
docker run -d -p 8080:8080 -v /planner/db:/db lnardon/planner
```

3 - Go to http://localhost:8080
