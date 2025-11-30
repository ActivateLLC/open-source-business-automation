# Open Source Business Automation Stack

Enterprise-grade business automation using 100% free and open-source tools - no license fees, no vendor lock-in.

![Business Automation Banner](https://raw.githubusercontent.com/ActivateLLC/open-source-business-automation/main/docs/images/banner.png)

## Overview

This repository provides a comprehensive business automation solution that combines powerful open-source tools to streamline critical business processes:

- **Lead Management**: Automated lead scoring, routing, and nurturing system
- **Content Creation**: AI-assisted content planning, generation, and distribution 
- **Financial Operations**: Invoice processing, payment tracking, and financial reporting

By implementing this stack, you can achieve enterprise-level automation without the enterprise-level price tag.

## 🚀 POC Stack: One Tool Per Use Case

For optimal results, we recommend using specialized tools for each use case:

| Use Case | Tool | License | Quick Win |
|----------|------|---------|-----------|
| **Lead Management** | [Activepieces](https://www.activepieces.com/) | MIT | 80% reduction in manual lead handling |
| **Content Creation** | [Windmill](https://www.windmill.dev/) | AGPL-3.0 | 10x content production speed |
| **Financial Ops** | [n8n](https://n8n.io/) | Fair-code | Process 100 invoices automatically |

### POC Stack Quick Start

```bash
# Start the POC stack with all three tools
docker-compose -f docker-compose-poc.yml up -d

# Access the platforms
# Activepieces (Lead Management): http://localhost:8080
# Windmill (Content Creation): http://localhost:8000
# n8n (Financial Operations): http://localhost:5678
# Metabase (Analytics): http://localhost:3000
```

📖 See the [POC Stack Documentation](docs/poc-stack.md) for detailed setup instructions.

## Key Benefits

- **Zero License Costs**: Built entirely with free and open-source software
- **Complete Data Ownership**: All data remains on your infrastructure
- **Unlimited Customization**: Modify any aspect to fit your specific business needs
- **Scalable Architecture**: Start small and expand as your business grows
- **No Vendor Lock-in**: Avoid dependency on proprietary SaaS platforms
- **Best Tool Per Job**: POC stack uses specialized tools for each use case

## Core Components

### POC Stack (Recommended)

1. **[Activepieces](https://www.activepieces.com/)**: Lead management automation (MIT license)
   - No-code UI accessible to non-engineers
   - API-friendly for developers
   - Clean, intuitive interface

2. **[Windmill](https://www.windmill.dev/)**: Content creation automation (AGPL-3.0)
   - Developer-centric with AI Flow Chat
   - Supports 20+ programming languages
   - Used by 3,000+ organizations

3. **[n8n](https://n8n.io/)**: Financial operations automation (Fair-code)
   - 350+ native integrations
   - Most mature for financial workflows
   - Excellent email and OCR support

4. **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database (PostgreSQL License)

5. **[Metabase](https://www.metabase.com/)**: Business intelligence and visualization (AGPL)

### Classic Stack (Single Tool)

1. **[n8n](https://n8n.io/)**: All-in-one workflow automation (Fair-code)
2. **[PostgreSQL](https://www.postgresql.org/)**: Database (PostgreSQL License)
3. **[Metabase](https://www.metabase.com/)**: Analytics (AGPL)
4. **[Docker](https://www.docker.com/)**: Containerization (Apache 2.0)

## Documentation

- [POC Stack Guide](docs/poc-stack.md): Specialized tool stack for optimal results
- [Installation Guide](docs/installation.md): Complete setup instructions
- [Workflow Documentation](docs/workflows/README.md): Detailed explanation of each workflow
- [Security Considerations](docs/security.md): Best practices for secure deployment
- [Maintenance Guide](docs/maintenance.md): Ongoing operations and troubleshooting

### POC Workflow Documentation

- [Lead Management (Activepieces)](docs/workflows/poc-lead-management.md): Automated lead scoring and routing
- [Content Automation (Windmill)](docs/workflows/poc-content-automation.md): AI-assisted content pipeline
- [Financial Operations (n8n)](docs/workflows/poc-finance-automation.md): Invoice processing and tracking

## Quick Start

### Option 1: POC Stack (Recommended)

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Start the POC stack
docker-compose -f docker-compose-poc.yml up -d

# Access the platforms
# Activepieces (Lead Management): http://localhost:8080
# Windmill (Content Creation): http://localhost:8000
# n8n (Financial Operations): http://localhost:5678
# Metabase (Analytics): http://localhost:3000
```

### Option 2: Classic Stack (n8n only)

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Start the classic stack
docker-compose up -d

# Access the platforms
# n8n: http://localhost:5678
# Metabase: http://localhost:3000
```

See the [Installation Guide](docs/installation.md) for complete setup instructions.

## System Requirements

### POC Stack
- Linux server with 8GB RAM, 4 CPU cores (recommended)
- 40GB+ storage space
- Docker and Docker Compose
- Internet connectivity

### Classic Stack
- Linux server with 4GB RAM, 2 CPU cores
- 20GB+ storage space
- Docker and Docker Compose
- Internet connectivity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the [MIT License](LICENSE).