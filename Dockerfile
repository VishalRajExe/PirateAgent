# -------------------------------------------------------------
# PirateAgent — LangGraph Agentic Engine Dockerfile
# -------------------------------------------------------------
FROM node:20-slim

WORKDIR /app

# Install dependency files
COPY package.json yarn.lock ./

# Install packages
RUN yarn install --frozen-lockfile

# Copy application source & scripts
COPY tsconfig.json langgraph.json ./
COPY src ./src
COPY scripts ./scripts

# Environment configuration
ENV PORT=2024
ENV HOST=0.0.0.0
EXPOSE 2024

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:2024/ok', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["yarn", "start"]
