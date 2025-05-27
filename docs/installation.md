# Installation Guide

This guide provides step-by-step instructions for setting up the Open Source Business Automation Stack on your server.

## Prerequisites

- A Linux server with at least 4GB RAM and 2 CPU cores
- Docker and Docker Compose installed
- 20GB+ of storage space
- Internet connectivity for the server
- Basic command line knowledge

## Installation Steps

### 1. Install Docker and Docker Compose

If you don't already have Docker and Docker Compose installed, run these commands:

```bash
# Update package information
sudo apt-get update

# Install required packages
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package information again
sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group (optional but recommended)
sudo usermod -aG docker $USER

# Verify installations
docker --version
docker-compose --version
```

### 2. Clone the Repository

```bash
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation
```

### 3. Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This script will create the necessary directory structure and template files.

### 4. Configure the Environment

1. Edit the `docker-compose.yml` file to change default passwords and other settings:

```bash
nano docker-compose.yml
```

2. Make sure to change the `N8N_ENCRYPTION_KEY` to a strong, random string.

### 5. Start the Services

```bash
docker-compose up -d
```

### 6. Access the Platforms

- n8n: `http://your-server-ip:5678`
- Metabase: `http://your-server-ip:3000`

### 7. Import the Workflows

1. Log in to n8n at `http://your-server-ip:5678`

2. Navigate to the Workflows section

3. For each workflow JSON file in the `workflows` directory:
   - Click "Import from File"
   - Select the workflow JSON file
   - Click "Import"
   - Save the workflow

4. Verify that all three workflows are imported:
   - Lead Management System (Free/Open Source)
   - Content Generation & Distribution Workflow
   - Financial Operations Automation

### 8. Set Up Metabase

1. Access Metabase in your browser at `http://your-server-ip:3000`

2. Follow the setup wizard to create your admin account

3. When prompted for database connection, choose to connect to the PostgreSQL database:
   - Host: postgres
   - Port: 5432
   - Database: n8n
   - Username: n8n
   - Password: n8n_password

## Security Considerations

For production use, consider implementing these security measures:

1. **Enable HTTPS**:
   - Use a reverse proxy like Nginx with Let's Encrypt certificates
   - Update the n8n environment variables to use HTTPS

2. **Password Protection**:
   - Enable n8n authentication by setting `N8N_BASIC_AUTH_ACTIVE=true`
   - Set username and password with `N8N_BASIC_AUTH_USER` and `N8N_BASIC_AUTH_PASSWORD`

3. **Firewall Configuration**:
   - Restrict access to your server using a firewall (UFW or iptables)
   - Only expose necessary ports (80/443 for web, 22 for SSH)

4. **Regular Backups**:
   - Implement automated backups of the data directory
   - Test restoration procedures regularly

Example Nginx configuration for HTTPS:

```
server {
    listen 80;
    server_name your-domain.com;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Common Issues

1. **n8n Not Starting**:
   - Check logs: `docker-compose logs n8n`
   - Verify PostgreSQL connection
   - Ensure proper volume permissions

2. **Webhook Connection Issues**:
   - Verify network/firewall settings
   - Check webhook URL formatting
   - Test with curl commands

3. **Database Connection Problems**:
   - Check PostgreSQL logs: `docker-compose logs postgres`
   - Verify credentials match across services
   - Check database availability

4. **Workflow Execution Failures**:
   - Check for syntax errors in function nodes
   - Verify file paths and permissions
   - Check for API rate limits

For any specific issues, refer to the official documentation:

- [n8n Documentation](https://docs.n8n.io/)
- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)