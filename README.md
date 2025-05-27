# Open Source Business Automation Stack

Enterprise-grade business automation using 100% free and open-source tools - no license fees, no vendor lock-in.

![Business Automation Banner](https://raw.githubusercontent.com/ActivateLLC/open-source-business-automation/main/docs/images/banner.png)

## Overview

This repository provides a comprehensive business automation solution that combines powerful open-source tools to streamline critical business processes:

- **Lead Management**: Automated lead scoring, routing, and nurturing system
- **Content Creation**: AI-assisted content planning, generation, and distribution 
- **Financial Operations**: Invoice processing, payment tracking, and financial reporting

By implementing this stack, you can achieve enterprise-level automation without the enterprise-level price tag.

## Key Benefits

- **Zero License Costs**: Built entirely with free and open-source software
- **Complete Data Ownership**: All data remains on your infrastructure
- **Unlimited Customization**: Modify any aspect to fit your specific business needs
- **Scalable Architecture**: Start small and expand as your business grows
- **No Vendor Lock-in**: Avoid dependency on proprietary SaaS platforms

## Core Components

1. **[n8n](https://n8n.io/)**: Powerful workflow automation platform (fair-code license)
2. **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database (PostgreSQL License)
3. **[Metabase](https://www.metabase.com/)**: Business intelligence and visualization (AGPL)
4. **[Docker](https://www.docker.com/)**: Containerization for easy deployment (Apache 2.0)

## Documentation

- [Installation Guide](docs/installation.md): Complete setup instructions
- [Workflow Documentation](docs/workflows/README.md): Detailed explanation of each workflow
- [Security Considerations](docs/security.md): Best practices for secure deployment
- [Maintenance Guide](docs/maintenance.md): Ongoing operations and troubleshooting

## Quick Start

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Start the automation stack
docker-compose up -d

# Access the platforms
# n8n: http://localhost:5678
# Metabase: http://localhost:3000
```

See the [Installation Guide](docs/installation.md) for complete setup instructions.

## System Requirements

- Linux server with 4GB RAM, 2 CPU cores
- 20GB+ storage space
- Docker and Docker Compose
- Internet connectivity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the [MIT License](LICENSE).