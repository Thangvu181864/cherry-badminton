## Document
Health check: [http://hostname/api/v1/health](http://hostname/api/v1/health) \
Api doc: [http://hostname/apidoc](http://hostname/apidoc)

## Installation
Install Node18, pm2, docker, docker-compose
```bash
cd monorepo-base
npm install
```
or
```bash
cd monorepo-base
yarn install
```

## Config & Pre-Run
Create  file `.env` from file `.env.example`

## Running the app
### dev mode
```bash
docker-compose up -d
npm run start:dev
```
### prod mode
```bash
docker-compose -f docker-compose.prod.yml up -d
```
## Build Docs
### build docs
```bash
npm run compodoc
```
### build docs watch
```bash
npm run compodoc:watch
```
## Build Images
```bash
docker build -t thangvu/monorepo-base .
```
### rename images
```bash
docker tag thangvu/monorepo-base:latest registry.gitlab.com/<username>/<repo>
```
### push images to gitlab
```bash
docker login registry.gitlab.com
docker build -t registry.gitlab.com/monorepo-base .
docker push registry.gitlab.com/monorepo-base
```
