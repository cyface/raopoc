export COMPOSE_BAKE=true
docker compose -f docker-compose.dev.yml stop app-dev && docker compose -f docker-compose.dev.yml rm -f app-dev && docker compose -f docker-compose.dev.yml up --build -d app-dev
