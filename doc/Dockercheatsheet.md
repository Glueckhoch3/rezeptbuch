# Docker, Compose & Kubernetes Cheat Sheet

A practical command reference split by work task.

## Chapter Overview

### Docker
1. [Images](#1-images)
2. [Containers – Run & Lifecycle](#2-containers--run--lifecycle)
3. [Inspecting & Debugging](#3-inspecting--debugging)
4. [Volumes & Data](#4-volumes--data)
5. [Networking](#5-networking)
6. [Building Images & Dockerfile](#6-building-images--dockerfile)
7. [Registry (Push/Pull/Login)](#7-registry-pushpulllogin)
8. [System & Cleanup](#8-system--cleanup)

### Docker Compose
9. [Compose – Lifecycle](#9-compose--lifecycle)
10. [Compose – Inspect & Debug](#10-compose--inspect--debug)
11. [Compose – Build & Scale](#11-compose--build--scale)

### Kubernetes
12. [Cluster & Context](#12-cluster--context)
13. [Pods, Deployments & Workloads](#13-pods-deployments--workloads)
14. [Inspecting & Debugging (kubectl)](#14-inspecting--debugging-kubectl)
15. [Services & Networking](#15-services--networking)
16. [Config, Secrets & Storage](#16-config-secrets--storage)
17. [Scaling, Rollouts & Updates](#17-scaling-rollouts--updates)
18. [Apply, Delete & YAML](#18-apply-delete--yaml)

---

# Docker

## 1. Images

| Command | Description |
|---|---|
| `docker images` | List local images |
| `docker pull <image>:<tag>` | Download an image |
| `docker image inspect <image>` | Show image metadata |
| `docker image history <image>` | Show layer history |
| `docker tag <image> <new>:<tag>` | Tag an image |
| `docker rmi <image>` | Remove an image |
| `docker image prune` | Remove dangling images |
| `docker image prune -a` | Remove all unused images |

[↑ Back to overview](#chapter-overview)

## 2. Containers – Run & Lifecycle

| Command | Description |
|---|---|
| `docker run <image>` | Create & start a container |
| `docker run -d <image>` | Run detached (background) |
| `docker run -it <image> sh` | Run interactive with a shell |
| `docker run --name <name> <image>` | Assign a name |
| `docker run -p 8080:80 <image>` | Map host:container port |
| `docker run -e KEY=val <image>` | Set environment variable |
| `docker run --rm <image>` | Auto-remove on exit |
| `docker run -v <vol>:/path <image>` | Mount a volume |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker start <container>` | Start a stopped container |
| `docker stop <container>` | Gracefully stop |
| `docker restart <container>` | Restart |
| `docker kill <container>` | Force stop |
| `docker rm <container>` | Remove a container |
| `docker rm -f <container>` | Force remove (running) |
| `docker rename <old> <new>` | Rename a container |

[↑ Back to overview](#chapter-overview)

## 3. Inspecting & Debugging

| Command | Description |
|---|---|
| `docker logs <container>` | View logs |
| `docker logs -f <container>` | Follow logs live |
| `docker logs --tail 100 <container>` | Last 100 log lines |
| `docker exec -it <container> sh` | Open a shell inside |
| `docker exec <container> <cmd>` | Run a command inside |
| `docker inspect <container>` | Full JSON details |
| `docker stats` | Live resource usage |
| `docker top <container>` | Running processes |
| `docker diff <container>` | Filesystem changes |
| `docker port <container>` | Show port mappings |
| `docker cp <container>:/path ./local` | Copy out of container |
| `docker cp ./local <container>:/path` | Copy into container |

[↑ Back to overview](#chapter-overview)

## 4. Volumes & Data

| Command | Description |
|---|---|
| `docker volume ls` | List volumes |
| `docker volume create <name>` | Create a volume |
| `docker volume inspect <name>` | Inspect a volume |
| `docker volume rm <name>` | Remove a volume |
| `docker volume prune` | Remove unused volumes |
| `docker run -v <name>:/data <image>` | Named volume mount |
| `docker run -v $(pwd):/app <image>` | Bind mount current dir |

[↑ Back to overview](#chapter-overview)

## 5. Networking

| Command | Description |
|---|---|
| `docker network ls` | List networks |
| `docker network create <name>` | Create a network |
| `docker network inspect <name>` | Inspect a network |
| `docker network connect <net> <container>` | Connect container |
| `docker network disconnect <net> <container>` | Disconnect container |
| `docker network rm <name>` | Remove a network |
| `docker network prune` | Remove unused networks |
| `docker run --network <name> <image>` | Run on a network |

[↑ Back to overview](#chapter-overview)

## 6. Building Images & Dockerfile

| Command | Description |
|---|---|
| `docker build -t <name>:<tag> .` | Build from Dockerfile |
| `docker build -f <file> .` | Use a specific Dockerfile |
| `docker build --no-cache -t <name> .` | Build ignoring cache |
| `docker build --build-arg KEY=val .` | Pass a build argument |
| `docker buildx build --platform linux/amd64,linux/arm64 .` | Multi-arch build |
| `docker commit <container> <image>` | Image from a container |

**Common Dockerfile instructions:** `FROM`, `WORKDIR`, `COPY`, `ADD`, `RUN`, `ENV`, `ARG`, `EXPOSE`, `CMD`, `ENTRYPOINT`, `VOLUME`, `USER`, `HEALTHCHECK`.

[↑ Back to overview](#chapter-overview)

## 7. Registry (Push/Pull/Login)

| Command | Description |
|---|---|
| `docker login` | Log in to Docker Hub |
| `docker login <registry>` | Log in to a private registry |
| `docker logout` | Log out |
| `docker pull <image>` | Pull an image |
| `docker push <user>/<image>:<tag>` | Push an image |
| `docker search <term>` | Search Docker Hub |

[↑ Back to overview](#chapter-overview)

## 8. System & Cleanup

| Command | Description |
|---|---|
| `docker system df` | Show disk usage |
| `docker system prune` | Remove unused data |
| `docker system prune -a --volumes` | Aggressive cleanup |
| `docker info` | System-wide info |
| `docker version` | Client/server version |
| `docker events` | Stream real-time events |
| `docker container prune` | Remove stopped containers |

[↑ Back to overview](#chapter-overview)

---

# Docker Compose

> Modern syntax uses `docker compose` (space). Older installs use `docker-compose`.

## 9. Compose – Lifecycle

| Command | Description |
|---|---|
| `docker compose up` | Create & start all services |
| `docker compose up -d` | Start detached |
| `docker compose up <service>` | Start one service |
| `docker compose down` | Stop & remove containers/networks |
| `docker compose down -v` | Also remove volumes |
| `docker compose start` | Start existing services |
| `docker compose stop` | Stop services |
| `docker compose restart` | Restart services |
| `docker compose pause` / `unpause` | Pause/resume services |

[↑ Back to overview](#chapter-overview)

## 10. Compose – Inspect & Debug

| Command | Description |
|---|---|
| `docker compose ps` | List service containers |
| `docker compose logs` | View all logs |
| `docker compose logs -f <service>` | Follow one service's logs |
| `docker compose exec <service> sh` | Shell into a service |
| `docker compose run <service> <cmd>` | One-off command |
| `docker compose top` | Running processes |
| `docker compose config` | Validate & view merged config |
| `docker compose events` | Stream events |

[↑ Back to overview](#chapter-overview)

## 11. Compose – Build & Scale

| Command | Description |
|---|---|
| `docker compose build` | Build/rebuild services |
| `docker compose build --no-cache` | Build without cache |
| `docker compose up --build` | Rebuild then start |
| `docker compose pull` | Pull service images |
| `docker compose push` | Push service images |
| `docker compose up -d --scale <service>=3` | Scale a service |
| `-f <file.yml>` | Use a specific compose file |

[↑ Back to overview](#chapter-overview)

---

# Kubernetes

> `kubectl` is the primary CLI. Tip: `alias k=kubectl`.

## 12. Cluster & Context

| Command | Description |
|---|---|
| `kubectl cluster-info` | Show cluster endpoints |
| `kubectl version` | Client/server version |
| `kubectl config get-contexts` | List contexts |
| `kubectl config current-context` | Show current context |
| `kubectl config use-context <name>` | Switch context |
| `kubectl config set-context --current --namespace=<ns>` | Set default namespace |
| `kubectl get nodes` | List cluster nodes |
| `kubectl get namespaces` | List namespaces |

[↑ Back to overview](#chapter-overview)

## 13. Pods, Deployments & Workloads

| Command | Description |
|---|---|
| `kubectl get pods` | List pods |
| `kubectl get pods -A` | All namespaces |
| `kubectl get pods -o wide` | Extra details (node, IP) |
| `kubectl get deployments` | List deployments |
| `kubectl get all` | List common resources |
| `kubectl run <name> --image=<image>` | Run a pod |
| `kubectl create deployment <name> --image=<image>` | Create a deployment |
| `kubectl delete pod <name>` | Delete a pod |
| `kubectl get rs` | List replica sets |
| `kubectl get jobs` / `cronjobs` | List jobs/cronjobs |

[↑ Back to overview](#chapter-overview)

## 14. Inspecting & Debugging (kubectl)

| Command | Description |
|---|---|
| `kubectl describe pod <name>` | Detailed pod info & events |
| `kubectl logs <pod>` | View pod logs |
| `kubectl logs -f <pod>` | Follow logs |
| `kubectl logs <pod> -c <container>` | Specific container logs |
| `kubectl logs --previous <pod>` | Logs from crashed instance |
| `kubectl exec -it <pod> -- sh` | Shell into a pod |
| `kubectl exec <pod> -- <cmd>` | Run a command in a pod |
| `kubectl get events --sort-by=.lastTimestamp` | Recent events |
| `kubectl top pod` / `top node` | Resource usage (metrics) |
| `kubectl cp <pod>:/path ./local` | Copy out of a pod |
| `kubectl debug <pod> -it --image=busybox` | Ephemeral debug container |

[↑ Back to overview](#chapter-overview)

## 15. Services & Networking

| Command | Description |
|---|---|
| `kubectl get svc` | List services |
| `kubectl expose deployment <name> --port=80 --type=ClusterIP` | Create a service |
| `kubectl get ingress` | List ingresses |
| `kubectl get endpoints` | List endpoints |
| `kubectl port-forward <pod> 8080:80` | Forward a local port |
| `kubectl port-forward svc/<name> 8080:80` | Forward to a service |

[↑ Back to overview](#chapter-overview)

## 16. Config, Secrets & Storage

| Command | Description |
|---|---|
| `kubectl get configmaps` | List ConfigMaps |
| `kubectl create configmap <name> --from-file=<f>` | ConfigMap from file |
| `kubectl create configmap <name> --from-literal=K=V` | ConfigMap from literal |
| `kubectl get secrets` | List secrets |
| `kubectl create secret generic <name> --from-literal=K=V` | Create a secret |
| `kubectl get pvc` | List persistent volume claims |
| `kubectl get pv` | List persistent volumes |
| `kubectl get sc` | List storage classes |

[↑ Back to overview](#chapter-overview)

## 17. Scaling, Rollouts & Updates

| Command | Description |
|---|---|
| `kubectl scale deployment <name> --replicas=3` | Scale a deployment |
| `kubectl autoscale deployment <name> --min=2 --max=10 --cpu-percent=80` | Autoscale (HPA) |
| `kubectl set image deployment/<name> <c>=<image>:<tag>` | Update image |
| `kubectl rollout status deployment/<name>` | Watch a rollout |
| `kubectl rollout history deployment/<name>` | Rollout history |
| `kubectl rollout undo deployment/<name>` | Roll back |
| `kubectl rollout restart deployment/<name>` | Restart pods |
| `kubectl edit deployment <name>` | Edit live resource |

[↑ Back to overview](#chapter-overview)

## 18. Apply, Delete & YAML

| Command | Description |
|---|---|
| `kubectl apply -f <file.yaml>` | Create/update from file |
| `kubectl apply -f <dir>/` | Apply a directory |
| `kubectl apply -k <dir>/` | Apply with Kustomize |
| `kubectl delete -f <file.yaml>` | Delete from file |
| `kubectl delete <type> <name>` | Delete a resource |
| `kubectl get <type> <name> -o yaml` | Export as YAML |
| `kubectl create <type> <name> --dry-run=client -o yaml` | Generate YAML template |
| `kubectl explain <resource>` | Field documentation |
| `kubectl diff -f <file.yaml>` | Preview changes |

[↑ Back to overview](#chapter-overview)
