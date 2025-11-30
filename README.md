# Open Source Business Automation Platform

Enterprise-grade business automation using 100% free and open-source tools - no license fees, no vendor lock-in. **Outperforming Odoo in every way.**

![Business Automation Banner](https://raw.githubusercontent.com/ActivateLLC/open-source-business-automation/main/docs/images/banner.png)

## 🏗️ Architecture: Microservices + Event-Driven

This platform implements a best-of-breed integrated architecture designed to outperform traditional monolithic ERP systems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED API GATEWAY (Traefik)                          │
│                        Single Entry Point for All                           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                    AUTOMATION ORCHESTRATION LAYER                           │
│   Activepieces (Primary - MIT) + Temporal (Long-running) + Apache Kafka    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
    ┌─────────────┬───────────────┼───────────────┬───────────────────────────┐
    │             │               │               │                           │
    │   LEAD      │   CONTENT     │  FINANCIAL    │   AI AGENT                │
    │ MANAGEMENT  │  AUTOMATION   │     OPS       │    LAYER                  │
    │             │               │               │                           │
    └─────────────┴───────────────┴───────────────┴───────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                          DATA & STORAGE LAYER                               │
│  PostgreSQL (Transactional) + Qdrant (Vector/AI) + ClickHouse (Analytics)  │
│                           + Redis (Cache)                                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                  UNIFIED BUSINESS INTELLIGENCE LAYER                        │
│  Apache Superset (Primary) + Metabase (Simple) + Grafana (Real-time)       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### Why This Platform Outperforms Odoo

| Feature | This Platform | Odoo |
|---------|---------------|------|
| **Architecture** | Microservices | Monolithic |
| **License** | MIT/Apache (fully open) | LGPL (limited) |
| **Scalability** | Horizontal per service | Vertical only |
| **AI/ML Ready** | Native vector database | Requires plugins |
| **Event Streaming** | Built-in Apache Kafka | Not available |
| **Analytics** | Dedicated OLAP (ClickHouse) | Shared database |
| **Cost** | 100% Free | Enterprise features paid |

### Business Automation Capabilities

- **Lead Management**: Automated lead scoring, intelligent routing, and lifecycle tracking
- **Content Automation**: AI-assisted planning, generation, and multi-channel distribution
- **Financial Operations**: Invoice processing, payment tracking, and financial reporting
- **AI Agent Layer**: Vector-based semantic search and RAG capabilities

## 🧩 Core Components

### Automation Orchestration Layer
| Component | Purpose | License |
|-----------|---------|---------|
| [Activepieces](https://www.activepieces.com/) | Primary workflow automation (replaces n8n) | MIT |
| [Temporal](https://temporal.io/) | Long-running workflow orchestration | MIT |
| [Apache Kafka](https://kafka.apache.org/) | Event streaming platform | Apache 2.0 |

### Data & Storage Layer
| Component | Purpose | License |
|-----------|---------|---------|
| [PostgreSQL](https://www.postgresql.org/) | Transactional database | PostgreSQL |
| [Qdrant](https://qdrant.tech/) | Vector database for AI/ML | Apache 2.0 |
| [ClickHouse](https://clickhouse.com/) | Analytics OLAP database | Apache 2.0 |
| [Redis](https://redis.io/) | Caching and message broker | BSD-3 |

### Business Intelligence Layer
| Component | Purpose | License |
|-----------|---------|---------|
| [Apache Superset](https://superset.apache.org/) | Primary BI platform | Apache 2.0 |
| [Metabase](https://www.metabase.com/) | Simple dashboards | AGPL-3.0 |
| [Grafana](https://grafana.com/) | Real-time operations monitoring | AGPL-3.0 |

### Infrastructure
| Component | Purpose | License |
|-----------|---------|---------|
| [Traefik](https://traefik.io/) | API Gateway & Load Balancer | MIT |
| [Docker](https://www.docker.com/) | Containerization | Apache 2.0 |

## 🚀 Quick Start

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start the automation platform
docker-compose up -d

# Wait for services to initialize (2-3 minutes)
# Then access the platforms:
```

### Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| Traefik Dashboard | http://localhost:8080 | - |
| Activepieces | http://localhost:8089 | Create on first access |
| Temporal UI | http://localhost:8088 | - |
| Kafka UI | http://localhost:8090 | - |
| Apache Superset | http://localhost:8088 | admin / admin |
| Metabase | http://localhost:3000 | Create on first access |
| Grafana | http://localhost:3001 | admin / admin |
| n8n (legacy) | http://localhost:5678 | Create on first access |

## 📖 Documentation

- [Architecture Guide](docs/architecture.md): Complete architecture documentation
- [Installation Guide](docs/installation.md): Detailed setup instructions
- [Workflow Documentation](docs/workflows/README.md): Workflow explanations
- [Security Considerations](docs/security.md): Security best practices
- [Maintenance Guide](docs/maintenance.md): Operations and troubleshooting

## 💻 System Requirements

### Minimum (Development)
- Linux/macOS/Windows with Docker
- 8GB RAM
- 4 CPU cores
- 40GB storage

### Recommended (Production)
- Linux server
- 16GB RAM
- 8 CPU cores
- 100GB+ SSD storage
- Docker and Docker Compose

## 🔄 Migration from n8n

The platform includes n8n for backward compatibility. To migrate existing workflows:

1. Export workflows from your current n8n instance
2. Import into the new n8n container
3. Gradually recreate workflows in Activepieces
4. Use Temporal for complex, long-running processes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is released under the [MIT License](LICENSE).

### Component Licenses

- Activepieces: MIT License
- Temporal: MIT License
- Apache Kafka: Apache 2.0
- PostgreSQL: PostgreSQL License
- Qdrant: Apache 2.0
- ClickHouse: Apache 2.0
- Redis: BSD-3-Clause
- Apache Superset: Apache 2.0
- Metabase: AGPL-3.0
- Grafana: AGPL-3.0
- Traefik: MIT License
- Docker: Apache 2.0

Users must comply with the respective licenses of these projects when using them.