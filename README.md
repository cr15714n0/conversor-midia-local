# ✨ Studio de Conversão de Mídia Local

Um conversor local de arquivos multimídia (vídeos e imagens) rápido, moderno, acolhedor e **100% offline**, sem anúncios, sem limites de tamanho e sem necessidade de login.

---

## 🌟 Principais Recursos

- 🔒 **100% Privado & Offline:** Seus arquivos nunca saem da sua máquina e não passam por nenhum servidor externo.
- 🚫 **Sem Anúncios e Sem Limites:** Converta vídeos de qualquer tamanho (inclusive 4K) sem assinaturas ou filas.
- 🎯 **Detecção Contextual Inteligente:**
  - Envie um **Vídeo** e veja apenas opções de vídeo (`MP4`, `WebM`, `MKV`, `AVI`, `MOV`, `GIF Animado`) ou extração de áudio (`MP3`, `WAV`).
  - Envie uma **Imagem** e veja apenas opções de imagem (`WebP`, `PNG`, `JPG`, `SVG`, `ICO`, `PDF`).
- ⚡ **Acompanhamento em Tempo Real:** Barra de progresso animada, porcentagem ao vivo, velocidade de renderização e estimativa de tempo restante (ETA).
- 🎨 **Design Moderno e Acolhedor:** Interface elegante e responsiva com tema escuro aconchegante, efeitos de vidro fosco (*frosted glass*) e tipografia agradável.
- 🔓 **Zero Login:** Abra no navegador e use diretamente.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
```

### 2. Iniciar o serviço
Basta rodar o script de inicialização:
```bash
./iniciar.sh
```
*(Ou via Docker Compose direto)*:
```bash
docker compose up -d
```

### 3. Acessar
Abra o seu navegador em:
👉 **[http://localhost:3000](http://localhost:3000)**

Para parar o serviço a qualquer momento:
```bash
./parar.sh
```

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** [Bun](https://bun.sh/) (alta performance e execução ultrarrápida de scripts e streams)
- **Motor de Vídeo:** [FFmpeg](https://ffmpeg.org/) (com preset otimizado e captura de progresso por pipe)
- **Motor de Imagem:** [ImageMagick](https://imagemagick.org/)
- **Frontend:** HTML5, [Tailwind CSS](https://tailwindcss.com/), Google Fonts (Plus Jakarta Sans)
- **Containerização:** [Docker](https://www.docker.com/)

---

## 📂 Estrutura do Projeto

```text
├── custom-app/
│   ├── public/
│   │   └── index.html      # Interface web moderna e responsiva
│   └── server.js           # Servidor Bun HTTP com controle do FFmpeg e progresso
├── docker-compose.yml       # Configuração para subir o container com 1 comando
├── Dockerfile              # Imagem Docker independente
├── iniciar.sh              # Script fácil de inicialização
├── parar.sh                # Script fácil para encerrar
├── .gitignore              # Ignora arquivos de upload e dados temporários
└── README.md               # Documentação do projeto
```

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
