# Security Considerations

This guide outlines important security considerations for deploying and maintaining the Open Source Business Automation Stack in a production environment.

## Security Overview

The Open Source Business Automation Stack handles important business data, including leads, financial information, and content. Proper security measures are essential to protect this data from unauthorized access and ensure the integrity of your automation processes.

## Network Security

### Firewall Configuration

Restrict network access to only the necessary ports:

```bash
# For Ubuntu/Debian with UFW
sudo ufw allow ssh            # SSH access (port 22)
sudo ufw allow http           # HTTP (port 80) for redirects
sudo ufw allow https          # HTTPS (port 443)
sudo ufw enable               # Enable the firewall

# Block direct access to internal services
sudo ufw deny 5678            # Block direct access to n8n
sudo ufw deny 5432            # Block direct access to PostgreSQL
sudo ufw deny 3000            # Block direct access to Metabase
```

### Reverse Proxy with HTTPS

Set up a reverse proxy (like Nginx) with HTTPS:

1. Install Nginx:
   ```bash
   sudo apt-get update
   sudo apt-get install -y nginx
   ```

2. Get SSL certificates with Let's Encrypt:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. Configure Nginx as reverse proxy:
   ```nginx
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

       # n8n
       location /n8n/ {
           proxy_pass http://localhost:5678/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Metabase
       location /metabase/ {
           proxy_pass http://localhost:3000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Update `docker-compose.yml` to use the proper base URLs:
   ```yaml
   n8n:
     environment:
       - N8N_HOST=your-domain.com
       - N8N_PROTOCOL=https
       - N8N_PATH=/n8n/
       # ... other environment variables
   
   metabase:
     environment:
       - MB_SITE_URL=https://your-domain.com/metabase
       # ... other environment variables
   ```

## Authentication and Authorization

### n8n Authentication

Enable basic authentication for n8n by adding these environment variables to `docker-compose.yml`:

```yaml
n8n:
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=use_a_strong_password_here
    # ... other environment variables
```

### PostgreSQL Security

1. Use strong passwords in `docker-compose.yml`:
   ```yaml
   postgres:
     environment:
       - POSTGRES_USER=n8n
       - POSTGRES_PASSWORD=use_a_strong_password_here
       - POSTGRES_DB=n8n
       # ... other environment variables
   ```

2. Restrict network access:
   ```yaml
   postgres:
     # ... other settings
     networks:
       - internal
     # Remove or comment out the ports section to prevent external access
     # ports:
     #   - "5432:5432"
   ```

### Webhook Security

Secure webhooks with authentication tokens:

1. Update the "Webhook Configuration" node in each workflow to include authentication tokens
2. Modify webhook URLs to include these tokens
3. Verify tokens in Function nodes that process webhook data

Example webhook URL with token:
```
https://your-domain.com/n8n/webhook/lead-capture?token=your_secret_token
```

## Data Security

### Encryption at Rest

1. Use disk encryption for the server:
   ```bash
   # For new installations on Ubuntu
   # Choose "Encrypt the new Ubuntu installation" during setup
   
   # For existing installations, consider using eCryptfs
   sudo apt-get install ecryptfs-utils
   ```

2. Encrypt sensitive fields in n8n workflows:
   - Use environment variables for sensitive data
   - Store API keys and credentials in n8n's credential store
   - Use the n8n encryption key for additional security

### Secure File Permissions

```bash
# Set proper permissions for data directories
sudo chown -R 1000:1000 data/n8n
sudo chmod -R 700 data/n8n/data

# Ensure PostgreSQL data is secure
sudo chown -R 999:999 data/postgres
sudo chmod -R 700 data/postgres
```

### Regular Backups with Encryption

```bash
# Create encrypted backup
tar -czf - data | gpg -c > backup-$(date +%Y-%m-%d).tar.gz.gpg

# Decrypt backup
gpg -d backup-2025-05-28.tar.gz.gpg | tar -xzf -
```

## Monitoring and Audit

### Enable Logging

Configure comprehensive logging in `docker-compose.yml`:

```yaml
n8n:
  environment:
    - N8N_LOG_LEVEL=info
    # ... other environment variables
  volumes:
    - ./logs/n8n:/home/node/.n8n/logs

postgres:
  command: postgres -c logging_collector=on -c log_directory=/var/log/postgresql -c log_filename=postgresql-%Y-%m-%d.log
  volumes:
    - ./logs/postgres:/var/log/postgresql
```

### Log Analysis

Regularly review logs for suspicious activity:

```bash
# Check n8n logs for failed authentication attempts
grep "authentication failed" logs/n8n/n8n.log

# Check Nginx access logs for unusual patterns
sudo tail -f /var/log/nginx/access.log | grep -v 200
```

### Security Monitoring

Consider implementing additional security monitoring:

1. Install Fail2ban to prevent brute force attacks:
   ```bash
   sudo apt-get install fail2ban
   ```

2. Configure Fail2ban for Nginx:
   ```bash
   # Create jail configuration
   sudo nano /etc/fail2ban/jail.d/nginx.conf

   # Add configuration
   [nginx-http-auth]
   enabled = true
   filter = nginx-http-auth
   port = http,https
   logpath = /var/log/nginx/error.log
   maxretry = 5
   ```

## Security Best Practices

### Regular Updates

Keep all components updated:

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Security Headers

Add security headers in Nginx configuration:

```nginx
server {
    # ... other settings
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" always;
    
    # ... location blocks
}
```

### Password Policies

Implement strong password policies:

1. Use long, complex passwords for all accounts
2. Store passwords in a secure password manager
3. Rotate passwords regularly
4. Use different passwords for different services

### Limiting Exposure

Reduce the attack surface:

1. Remove unnecessary services from the server
2. Keep Docker and container images updated
3. Use minimal base images when possible
4. Don't expose admin interfaces to the public internet

## Incident Response

### Prepare an Incident Response Plan

1. Document potential security incidents
2. Assign roles and responsibilities
3. Create communication templates
4. Establish recovery procedures

### In Case of a Security Breach

1. Isolate affected systems
2. Assess the damage
3. Restore from clean backups
4. Implement additional security measures
5. Document the incident and response

## Regular Security Audits

Perform regular security audits:

1. Review user access
2. Check for unauthorized changes
3. Verify backup integrity
4. Test security controls
5. Update security documentation

## Conclusion

Security is an ongoing process that requires constant attention and updates. By implementing these security measures, you can significantly reduce the risk of unauthorized access and data breaches in your Open Source Business Automation Stack.

Remember that no system is 100% secure, and new vulnerabilities are discovered regularly. Stay informed about security best practices and apply updates promptly to maintain a strong security posture.