Blue-Green Deployment 

Prerequisites

Node.js >= 18
Docker & Docker Compose
Kubernetes (Minikube)
kubectl
MongoDB instance 

Part 1: Local Deployment
Clone the repository:
git clone <repo-url>
cd <repo-folder>


Install dependencies for backend and frontends:
cd backend
npm install

cd ../frontend-blue
npm install

cd ../frontend-green
npm install

Configure MongoDB connection in .env file for backend:
MONGO_URI=<your_mongo_uri>

Start backend and frontends:

# Backend
cd backend
node server.js

# Frontend Blue
cd ../frontend-blue
node server.js

# Frontend Green
cd ../frontend-green
node server.js 

Verify:
Backend responds to health checks at http://localhost:5000/health
Both frontends accessible in browser and able to register users
Data successfully stored in MongoDB
http://localhost:3100 - for blue frontend
http://localhost:3200 - for green frontend 

Part 2: Containerization
Dockerfiles created for backend and both frontends
Docker Compose setup to run all services together: docker-compose.yml
Build and run containers:

Backend Dockerfile : 
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"] 


Frontend Blue Dockerfile : 
# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the app
COPY . .

# Expose port (same as in server.js, e.g., 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 


Frontend Green Dockerfile
# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the app
COPY . .


Docker Compose file :
services:
  # =====================
  # MongoDB Database
  # =====================
  mongo:
    image: mongo:6.0
    container_name: mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
   

  # =====================
  # Backend Service
  # =====================
  backend:
    build: ./backend
    container_name: backend
    restart: always
    ports:
      - "5001:5000"
   
    depends_on:
      - mongo
    environment:
      - MONGO_URI=mongodb://localhost:27017/bluegreen_db
    volumes:
      - ./backend:/usr/src/app
    command: npm run dev

  # =====================
  # Frontend - Blue
  # =====================
  frontend-blue:
    build: ./frontend-blue
    container_name: frontend-blue
    restart: always
    ports:
      - "3001:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend-blue:/usr/src/app
    command: npm start

  # =====================
  # Frontend - Green
  # =====================
  frontend-green:
    build: ./frontend-green
    container_name: frontend-green
    restart: always
    ports:
      - "3002:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend-green:/usr/src/app
    command: npm start

volumes:
  mongo-data:

  docker-compose up --build


Verify:

Containers running successfully: docker ps

Services functional via browser and API endpoints

# Expose port (same as in server.js, e.g., 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]


Part 3: Kubernetes Deployment

Kubernetes manifests created for backend, frontends, and MongoDB (k8s/ folder)

Apply resources to Minikube:

kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend-blue.yaml
kubectl apply -f k8s/frontend-green.yaml


Verify:

Pods running: kubectl get pods

Services running: kubectl get svc

Health checks configured correctly


Backend YAML file : 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: backend:v1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5000
          env:
            - name: MONGO_URI
              value: "mongodb://mongo:27017/bluegreen_db"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 5000
      targetPort: 5000
      nodePort: 30050


Frontend Blue YAML file : 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-blue
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend-blue
  template:
    metadata:
      labels:
        app: frontend-blue
    spec:
      containers:
        - name: frontend-blue
          image: frontend-blue:v1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          env:
            - name: REACT_APP_API_URL
              value: "http://backend:5000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-blue
spec:
  type: NodePort
  selector:
    app: frontend-blue
  ports:
    - port: 3000
      targetPort: 3001   # FIXED
      nodePort: 30051


  Frontend Green YAML file : 
  apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-green
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend-green
  template:
    metadata:
      labels:
        app: frontend-green
    spec:
      containers:
        - name: frontend-green
          image: frontend-green:v1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          env:
            - name: REACT_APP_API_URL
              value: "http://backend:5000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-green
spec:
  type: NodePort
  selector:
    app: frontend-green
  ports:
    - port: 3000
      targetPort: 3200   # FIXED
      nodePort: 30052

Part 4: Blue-Green Deployment Implementation

Two separate deployments: frontend-blue and frontend-green

Service frontend-service switches traffic between deployments

Switch traffic using:

# Switch to Green
kubectl patch svc frontend-service -p '{"spec":{"selector":{"app":"frontend-green"}}}'

# Switch back to Blue
kubectl patch svc frontend-service -p '{"spec":{"selector":{"app":"frontend

