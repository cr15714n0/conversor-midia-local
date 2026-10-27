FROM oven/bun:latest

# Instalar FFmpeg e ImageMagick para processamento de vídeo e imagem
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar código da aplicação
COPY custom-app ./custom-app

EXPOSE 3000

CMD ["bun", "/app/custom-app/server.js"]
