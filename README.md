# Planner

A self hosted day planner.

<img src="./demo.gif" style="width: 100%"/>

</br>

## How to use

### Build from source

1 - Clone the repository and build the Docker image:

```bash
git clone https://github.com/lnardon/Planner.git && cd Planner && docker build -t Planner .
```

2 - Start the container using the following command.

```bash
docker run -d -p 8080:8080 Planner
```

3 - Go to http://localhost:8080
