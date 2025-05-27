# Security Considerations

This guide outlines security best practices for deploying and maintaining the Open Source Business Automation Stack in a production environment.

## Overview

Security is a critical aspect of any business automation system. The stack handles sensitive business data including leads, financial information, and content, so proper security measures are essential.

## Server Security

### Operating System Hardening

1. **Keep the system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Enable automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Configure a firewall**:
   ```bash
   sudo apt install ufw
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

4. **Disable unnecessary services**:
   ```bash
   sudo systemctl disable [service-name]
   ```

### User Management

1. **Create a dedicated user for the application**:
   ```bash
   sudo adduser automation
   sudo usermod -aG docker automation
   ```

2. **Use SSH keys instead of passwords**:
   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -C "automation-server"
   
   # Copy the key to the server
   ssh-copy-id automation@your-server-ip
   
   # Disable password authentication on the server
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

## Application Security

### Docker Security

1. **Use specific version tags** instead of `latest` to ensure reproducible builds.

2. **Run containers as non-root** whenever possible:
   ```yaml
   # Add to docker-compose.yml
   user: "1000:1000"
   ```

3. **Limit container resources**:
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '0.50'
         memory: 512M
   ```

4. **Regularly update container images**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### HTTPS Configuration

Set up HTTPS using Let's Encrypt and Nginx:

1. **Install Nginx and Certbot**:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/automation
   ```

   Add the following configuration:
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

3. **Enable the site and get SSL certificates**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/automation /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. **Update n8n configuration** in `docker-compose.yml`:
   ```yaml
   environment:
     - N8N_PROTOCOL=https
     - N8N_HOST=your-domain.com
     - N8N_PORT=443
   ```

### Authentication

1. **Enable n8n authentication** by updating `docker-compose.yml`:
   ```yaml
   environment:
     - N8N_BASIC_AUTH_ACTIVE=true
     - N8N_BASIC_AUTH_USER=admin
     - N8N_BASIC_AUTH_PASSWORD=use_a_secure_password
   ```

2. **Set up Metabase authentication** during the initial setup process.

3. **Secure PostgreSQL** by updating `docker-compose.yml`:
   ```yaml
   environment:
     - POSTGRES_PASSWORD=use_a_different_secure_password
   ```

## Data Security

### Encryption

1. **Encrypt sensitive data in n8n workflows**:
   - Use the `N8N_ENCRYPTION_KEY` environment variable
   - Store API keys and credentials using n8n's credential store

2. **Implement encryption-at-rest** for the entire data directory:
   ```bash
   # Install required tools
   sudo apt install cryptsetup
   
   # Create an encrypted volume (example)
   sudo cryptsetup luksFormat /dev/sdb1
   sudo cryptsetup luksOpen /dev/sdb1 automation-data
   sudo mkfs.ext4 /dev/mapper/automation-data
   sudo mount /dev/mapper/automation-data /path/to/data
   ```

### Backup and Recovery

1. **Implement regular backups**:
   ```bash
   # Create a backup script
   nano backup.sh
   ```

   Add the following content:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   BACKUP_DIR="/path/to/backups"
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Stop containers to ensure data consistency
   docker-compose down
   
   # Create a compressed backup of the data directory
   tar -czf $BACKUP_DIR/automation-data-$TIMESTAMP.tar.gz /path/to/automation/data
   
   # Restart containers
   docker-compose up -d
   
   # Remove backups older than 30 days
   find $BACKUP_DIR -name "automation-data-*.tar.gz" -mtime +30 -delete
   ```

2. **Make the script executable and schedule it**:
   ```bash
   chmod +x backup.sh
   
   # Schedule with cron (runs daily at 2 AM)
   crontab -e
   0 2 * * * /path/to/backup.sh
   ```

## Webhook Security

Webhooks can be a potential security risk. Implement these precautions:

1. **Use webhook authentication** by adding a secret token to webhook URLs

2. **Validate webhook payloads** in your Function nodes

3. **Implement rate limiting** in your Nginx configuration:
   ```
   location /webhook/ {
       limit_req zone=webhook burst=10 nodelay;
       proxy_pass http://localhost:5678;
       # other proxy settings...
   }
   ```

4. **Log webhook requests** for auditing and monitoring

## Regular Security Audits

Schedule regular security audits:

1. **Review server logs** for suspicious activity
   ```bash
   sudo journalctl -u docker
   ```

2. **Check for unauthorized access attempts**
   ```bash
   sudo grep "Failed password" /var/log/auth.log
   ```

3. **Scan for vulnerabilities**
   ```bash
   sudo apt install nmap
   nmap -sV your-server-ip
   ```

4. **Review workflow permissions** and access control in n8n and Metabase

## Incident Response Plan

Prepare an incident response plan that includes:

1. **Detection procedures**: How to identify security breaches
2. **Containment strategy**: Steps to limit damage
3. **Eradication process**: How to remove the threat
4. **Recovery plan**: Steps to restore systems
5. **Documentation requirements**: What to record during an incident
6. **Post-incident review**: How to learn from the incident

## Additional Resources

- [Docker Security Documentation](https://docs.docker.com/engine/security/)
- [n8n Security Best Practices](https://docs.n8n.io/hosting/security/)
- [OWASP Top Ten Project](https://owasp.org/www-project-top-ten/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)