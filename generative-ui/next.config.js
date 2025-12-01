/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    POSTGRES_HOST: process.env.POSTGRES_HOST || 'postgres',
    POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
    POSTGRES_DB: process.env.POSTGRES_DB || 'n8n',
    POSTGRES_USER: process.env.POSTGRES_USER || 'n8n',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'n8n_password',
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://ollama:11434',
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'kafka:9092',
    N8N_HOST: process.env.N8N_HOST || 'http://n8n:5678',
  },
}

module.exports = nextConfig
