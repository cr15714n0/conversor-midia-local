#!/usr/bin/env bash
cd "$(dirname "$0")"
docker compose up -d
echo "ConvertX iniciado com sucesso!"
echo "Acesse no seu navegador: http://localhost:3000"
