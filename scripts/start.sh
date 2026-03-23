#!/bin/sh
set -e
docker compose up -d
echo "Kanban app is running at http://localhost:4000"
