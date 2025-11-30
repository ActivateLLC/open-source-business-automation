# Security Considerations

This guide outlines important security considerations for deploying and maintaining the Open Source Business Automation Platform in a production environment.

## Security Overview

The Open Source Business Automation Platform handles critical business data including leads, financial information, content, and AI embeddings. With its microservices architecture, security must be implemented at multiple layers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Network:        Firewall, TLS, Network Segmentation                        │
│  Gateway:        Traefik (Rate Limiting, Auth Middleware)                   │
│  Application:    Service-level Authentication                               │
│  Data:           Encryption at Rest, Access Control                         │
│  Audit:          Kafka Event Logging, Access Logs                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Network Security

### Firewall Configuration

Restrict network access to only necessary ports:

```bash
# For Ubuntu/Debian with UFW
sudo ufw allow ssh            # SSH access (port 22)
sudo ufw allow http           # HTTP (port 80) for redirects
sudo ufw allow https          # HTTPS (port 443)
sudo ufw enable               # Enable the firewall

# Block direct access to ALL internal services
sudo ufw deny 5678            # n8n
sudo ufw deny 5432            # PostgreSQL
sudo ufw deny 3000            # Metabase
sudo ufw deny 3001            # Grafana
sudo ufw deny 6379            # Redis
sudo ufw deny 9092            # Kafka
sudo ufw deny 6333            # Qdrant
sudo ufw deny 8123            # ClickHouse
sudo ufw deny 7233            # Temporal gRPC
sudo ufw deny 8088            # Temporal UI / Superset
sudo ufw deny 8089            # Activepieces
sudo ufw deny 8090            # Kafka UI
```

### Traefik as Secure Gateway

The platform uses Traefik as the unified API gateway with built-in security features:

```yaml
# config/traefik/traefik.yml
api:
  dashboard: true
  insecure: false  # Require authentication for dashboard

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /acme/acme.json
      httpChallenge:
        entryPoint: web

# Rate limiting middleware
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
    
    secure-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        contentTypeNosniff: true
        browserXssFilter: true
        frameDeny: true
        contentSecurityPolicy: "default-src 'self'"
```

### Network Segmentation

The platform uses Docker networks for segmentation:

```yaml
networks:
  frontend:
    driver: bridge
    # Public-facing services only
    
  backend:
    driver: bridge
    internal: true  # No external access
    # Databases, Kafka, internal services
```

## Authentication and Authorization

### Service Authentication

Each service has its own authentication mechanism:

| Service | Authentication Method | Configuration |
|---------|----------------------|---------------|
| Activepieces | Built-in user management | Create admin on first access |
| Temporal | Optional mTLS | Configure in temporal config |
| Superset | Built-in user management | OAuth2/LDAP optional |
| Metabase | Built-in user management | LDAP/SAML optional |
| Grafana | Built-in user management | OAuth2/LDAP optional |
| n8n (legacy) | Basic auth or user management | Environment variables |

### Activepieces Authentication

```yaml
activepieces:
  environment:
    - AP_JWT_SECRET=your_strong_jwt_secret
    - AP_ENCRYPTION_KEY=your_32_char_encryption_key
```

### PostgreSQL Security

1. Use strong passwords in `.env`:
   ```bash
   POSTGRES_USER=automation
   POSTGRES_PASSWORD=your_strong_password_here
   ```

2. Restrict network access (backend network only):
   ```yaml
   postgres:
     networks:
       - backend  # Internal only, not frontend
   ```

### Redis Security

```yaml
redis:
  command: redis-server --appendonly yes --requirepass your_redis_password
```

### Kafka Security

For production, enable SASL authentication:

```yaml
kafka:
  environment:
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: SASL_PLAINTEXT:SASL_PLAINTEXT
    KAFKA_SASL_ENABLED_MECHANISMS: SCRAM-SHA-256
    KAFKA_SASL_MECHANISM_INTER_BROKER_PROTOCOL: SCRAM-SHA-256
```

### API Security

Secure all webhook endpoints with authentication:

```yaml
# Traefik middleware for API key authentication
http:
  middlewares:
    api-auth:
      headers:
        customRequestHeaders:
          X-API-Key: "required"
```

Example webhook URL with token:
```
https://your-domain.com/webhook/lead-capture?token=your_secret_token
```

## Data Security

### Encryption at Rest

1. Use disk encryption for the server:
   ```bash
   # For new installations on Ubuntu
   # Choose "Encrypt the new Ubuntu installation" during setup
   
   # For existing installations, consider using LUKS
   sudo cryptsetup luksFormat /dev/sdb
   sudo cryptsetup open /dev/sdb encrypted_data
   ```

2. Database-level encryption:
   - PostgreSQL: Enable `pgcrypto` extension for field-level encryption
   - ClickHouse: Enable encryption for MergeTree tables
   - Redis: Use encrypted connections with TLS

3. Application-level encryption:
   - Activepieces encrypts credentials with `AP_ENCRYPTION_KEY`
   - Store API keys in secure credential stores
   - Use environment variables for sensitive data

### Secure File Permissions

```bash
# Set proper permissions for all data directories
sudo chown -R 1000:1000 data/n8n data/activepieces
sudo chown -R 999:999 data/postgres
sudo chown -R 101:101 data/clickhouse
sudo chown -R 1000:1000 data/redis data/qdrant
sudo chown -R 472:472 data/grafana
sudo chmod -R 700 data/
```

### Secrets Management

For production, use proper secrets management:

```yaml
# docker-compose.yml with Docker secrets
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  redis_password:
    file: ./secrets/redis_password.txt

services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

### Regular Backups with Encryption

```bash
# Create encrypted backup of all data
tar -czf - data | gpg --symmetric --cipher-algo AES256 > backup-$(date +%Y-%m-%d).tar.gz.gpg

# Decrypt backup
gpg -d backup-2024-01-01.tar.gz.gpg | tar -xzf -
```

## Monitoring and Audit

### Centralized Logging with Kafka

All security events are streamed to Kafka for audit:

```json
{
  "event_type": "security.login_attempt",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "activepieces",
  "user_id": "uuid",
  "ip_address": "192.168.1.1",
  "success": false,
  "details": {
    "reason": "invalid_password"
  }
}
```

### Enable Comprehensive Logging

```yaml
# docker-compose.yml logging configuration
services:
  activepieces:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  traefik:
    command:
      - "--accesslog=true"
      - "--accesslog.filepath=/var/log/traefik/access.log"
      - "--accesslog.format=json"
```

### Grafana Security Dashboards

Create dashboards in Grafana to monitor:

1. **Authentication Events**:
   - Failed login attempts
   - Unusual login patterns
   - Geographic anomalies

2. **API Activity**:
   - Request rates per endpoint
   - Error rates
   - Response times

3. **System Integrity**:
   - Container restarts
   - Resource anomalies
   - Configuration changes

### Security Monitoring with Fail2ban

Implement Fail2ban to prevent brute force attacks:

```bash
sudo apt-get install fail2ban

# Create Traefik jail configuration
sudo tee /etc/fail2ban/jail.d/traefik.conf << 'EOF'
[traefik-auth]
enabled = true
port = http,https
filter = traefik-auth
logpath = /path/to/traefik/access.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# Create filter
sudo tee /etc/fail2ban/filter.d/traefik-auth.conf << 'EOF'
[Definition]
failregex = ^.*"ClientHost":"<HOST>".*"OriginStatus":401.*$
EOF

sudo systemctl restart fail2ban
```

## Security Best Practices

### Regular Updates

Keep all components updated:

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Update all Docker images
docker-compose pull
docker-compose up -d

# Verify no vulnerabilities in images
docker scan activepieces/activepieces:latest
```

### Security Headers via Traefik

Configure security headers in Traefik (already using as gateway):

```yaml
# config/traefik/dynamic.yml
http:
  middlewares:
    secure-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        contentTypeNosniff: true
        browserXssFilter: true
        frameDeny: true
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        referrerPolicy: "strict-origin-when-cross-origin"
        customResponseHeaders:
          X-Robots-Tag: "noindex, nofollow"
```

### Password Policies

Implement strong password policies across all services:

1. **Minimum Requirements**:
   - 16+ characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No common patterns or dictionary words

2. **Storage**:
   - Use a secrets manager (HashiCorp Vault, AWS Secrets Manager)
   - Never commit secrets to version control
   - Encrypt `.env` files on disk

3. **Rotation**:
   - Rotate service account passwords quarterly
   - Rotate user passwords annually
   - Immediate rotation if compromise suspected

### Service Hardening

Reduce attack surface for each service:

1. **Disable unnecessary features**:
   ```yaml
   # Activepieces - disable telemetry
   activepieces:
     environment:
       - AP_TELEMETRY_ENABLED=false
   ```

2. **Restrict database access**:
   ```sql
   -- PostgreSQL: Create read-only users for reporting
   CREATE USER readonly_user WITH PASSWORD 'password';
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
   ```

3. **Limit container capabilities**:
   ```yaml
   services:
     activepieces:
       security_opt:
         - no-new-privileges:true
       read_only: true
       tmpfs:
         - /tmp
   ```

## Incident Response

### Prepare an Incident Response Plan

1. **Document potential incidents**:
   - Unauthorized access attempts
   - Data breaches
   - Service disruptions
   - Malware infections

2. **Assign roles**:
   - Incident Commander
   - Technical Lead
   - Communications Lead
   - Legal/Compliance

3. **Create runbooks** for common scenarios

### In Case of a Security Breach

```bash
# 1. Immediate isolation
docker-compose stop affected_service
sudo iptables -A INPUT -s attacker_ip -j DROP

# 2. Capture evidence
docker logs affected_service > /evidence/logs_$(date +%s).txt
docker inspect affected_service > /evidence/inspect_$(date +%s).json

# 3. Assess scope
docker-compose exec postgres psql -U automation -c "SELECT * FROM public.events WHERE event_type LIKE 'security.%' ORDER BY created_at DESC LIMIT 100;"

# 4. Notify stakeholders
# 5. Restore from known-good backup
# 6. Implement fixes
# 7. Document incident
```

## Regular Security Audits

### Monthly Checklist

- [ ] Review user access across all services
- [ ] Check for unauthorized container modifications
- [ ] Verify backup integrity with test restores
- [ ] Review Traefik access logs for anomalies
- [ ] Update security documentation

### Quarterly Checklist

- [ ] Rotate all service passwords
- [ ] Review and update firewall rules
- [ ] Perform vulnerability scans
- [ ] Review third-party dependencies
- [ ] Conduct penetration testing

### Tools for Auditing

```bash
# Container vulnerability scanning
docker scan activepieces/activepieces:latest

# Network scanning
nmap -sV localhost

# Check for exposed secrets
gitleaks detect --source .

# Audit Docker configuration
docker-bench-security
```

## Compliance Considerations

### GDPR

- Data encryption at rest and in transit
- Right to erasure (data deletion capabilities)
- Data export functionality
- Consent management

### SOC 2

- Access control policies
- Audit logging
- Change management
- Incident response procedures

### HIPAA (if handling health data)

- Additional encryption requirements
- Access logging and monitoring
- Business associate agreements

## Conclusion

Security is an ongoing process that requires constant attention and updates. By implementing these security measures, you can significantly reduce the risk of unauthorized access and data breaches in your Open Source Business Automation Platform.

Key security principles:
1. **Defense in depth**: Multiple layers of security
2. **Least privilege**: Minimum necessary access
3. **Zero trust**: Verify everything
4. **Continuous monitoring**: Always watching

Stay informed about security best practices and apply updates promptly to maintain a strong security posture.