# Security Considerations

This document outlines important security considerations for your Open Source Business Automation Stack.

## Overview

While this automation stack provides powerful functionality with zero licensing costs, proper security measures are essential to protect your business data and operations. This guide covers key security considerations and best practices for securing your deployment.

## Authentication

### n8n Authentication

By default, the n8n instance in the provided Docker Compose file does not have authentication enabled. For production use, enable basic authentication:

1. Edit the `docker-compose.yml` file to add these environment variables to the n8n service:

```yaml
environment:
  # ... existing variables
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=your_username
  - N8N_BASIC_AUTH_PASSWORD=your_secure_password
```

2. Use a strong, unique password for the n8n interface.

3. Restart the services:

```bash
docker-compose down
docker-compose up -d
```

### Metabase Authentication

During the initial Metabase setup, you'll be prompted to create an admin account. Ensure you:

1. Use a strong, unique password for the admin account
2. Create additional user accounts with appropriate permissions for team members
3. Avoid sharing the admin credentials

## Network Security

### HTTPS Configuration

For production deployments, configure HTTPS using a reverse proxy:

1. Install Nginx:

```bash
sudo apt-get install nginx
```

2. Install Certbot for Let's Encrypt certificates:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

3. Configure the certificates:

```bash
sudo certbot --nginx -d your-domain.com
```

4. Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/automation-stack
```

5. Add this configuration (adjust as needed):

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

server {
    listen 443 ssl;
    server_name metabase.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/metabase.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/metabase.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/automation-stack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Firewall Configuration

Configure a firewall to restrict access:

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt-get install ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable the firewall
sudo ufw enable

# Check status
sudo ufw status
```

With this configuration, only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) will be accessible from the outside.

## Webhook Security

The workflows use webhooks for receiving data and notifications. Secure these endpoints:

1. Implement webhook authentication by adding a secret token to your webhook URLs:

```bash
# Example webhook URL with authentication token
https://your-domain.com/webhook/lead-capture?token=your_secret_token
```

2. Verify this token in your workflow by adding a Function node after each webhook that checks for the token:

```javascript
// Check webhook token
if ($input.item.query.token !== 'your_secret_token') {
  return {
    json: {
      error: 'Unauthorized',
      status: 401
    }
  };
}
```

3. Use HTTPS for all webhook URLs to encrypt the data in transit.

## Data Security

### Sensitive Data Handling

1. Avoid storing sensitive data like passwords, API keys, or personal information in plain text within workflow data files.

2. For workflows that need to process sensitive data, implement data masking or encryption:

```javascript
// Example of masking sensitive data
if (data.creditCardNumber) {
  // Store only the last 4 digits
  data.creditCardNumber = '****-****-****-' + data.creditCardNumber.slice(-4);
}
```

3. For API keys and credentials, use the n8n credentials manager.

### Backup Security

1. Encrypt your backups:

```bash
# Example: Create an encrypted backup of the data directory
tar -czf - data | gpg -c > backup-$(date +%Y%m%d).tar.gz.gpg
```

2. Store backups securely, preferably off-site.

3. Test restoration procedures regularly to ensure backups are valid.

## Regular Updates

Keep all components of the stack updated:

```bash
# Update Docker images
docker-compose pull

# Restart with updated images
docker-compose up -d

# Update the host system
sudo apt-get update
sudo apt-get upgrade
```

## Security Auditing

Regularly audit your security setup:

1. Check for unauthorized access in logs:

```bash
docker-compose logs n8n | grep "Failed login"
```

2. Review workflow permissions and access controls.

3. Scan for vulnerabilities in your server:

```bash
# Install security scanning tools
sudo apt-get install lynis

# Run a security audit
sudo lynis audit system
```

## Conclusion

By implementing these security measures, you can significantly enhance the security posture of your Open Source Business Automation Stack. Remember that security is an ongoing process that requires regular attention and updates.

For additional security resources, consult:
- [n8n Security Documentation](https://docs.n8n.io/hosting/security/)
- [Metabase Security Guide](https://www.metabase.com/docs/latest/operations-guide/security-guidelines)
- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/security.html)