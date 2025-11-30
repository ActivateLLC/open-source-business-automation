# Maintenance Guide

This guide provides instructions for maintaining and troubleshooting the Open Source Business Automation Platform after initial deployment.

## System Overview

The platform consists of multiple services that need to be monitored and maintained:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Gateway:        Traefik                                                    │
│  Automation:     Activepieces, Temporal, n8n (legacy)                       │
│  Event Stream:   Kafka, Zookeeper                                           │
│  Databases:      PostgreSQL, ClickHouse, Redis, Qdrant                      │
│  BI Tools:       Superset, Metabase, Grafana                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Regular Maintenance Tasks

### Daily Tasks

- Check Activepieces workflow execution logs
- Verify Temporal workflow completions
- Monitor Grafana dashboards for anomalies
- Review Kafka consumer lag
- Check disk space usage

### Weekly Tasks

- Back up all databases (PostgreSQL, ClickHouse)
- Review workflow performance metrics
- Check for failed Temporal workflows
- Clear Redis cache if memory pressure
- Review Traefik access logs for security issues

### Monthly Tasks

- Apply updates to all Docker images
- Review and rotate secrets/passwords
- Clean up old analytics data in ClickHouse
- Vacuum PostgreSQL databases
- Review Qdrant vector index performance
- Audit user access across all services

## Service Health Checks

### Quick Health Check Script

```bash
#!/bin/bash
echo "=== Platform Health Check ==="

# Check all containers
echo -e "\n--- Container Status ---"
docker-compose ps

# PostgreSQL
echo -e "\n--- PostgreSQL ---"
docker-compose exec -T postgres pg_isready -U automation && echo "OK" || echo "FAILED"

# Redis
echo -e "\n--- Redis ---"
docker-compose exec -T redis redis-cli -a redis_password ping

# ClickHouse
echo -e "\n--- ClickHouse ---"
curl -s http://localhost:8123/ping && echo " OK" || echo "FAILED"

# Qdrant
echo -e "\n--- Qdrant ---"
curl -s http://localhost:6333/health | jq .

# Kafka
echo -e "\n--- Kafka ---"
docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 2>&1 | head -5

# Traefik
echo -e "\n--- Traefik ---"
curl -s http://localhost:8080/api/rawdata | jq '.routers | keys'

echo -e "\n=== Health Check Complete ==="
```

### Individual Service Checks

```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U automation
docker-compose exec postgres psql -U automation -c "SELECT 1;"

# Redis
docker-compose exec redis redis-cli -a redis_password ping
docker-compose exec redis redis-cli -a redis_password info memory

# ClickHouse
curl -s "http://localhost:8123/?query=SELECT%201"
curl -s "http://localhost:8123/?query=SELECT%20version()"

# Qdrant
curl -s http://localhost:6333/health
curl -s http://localhost:6333/collections

# Kafka
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Temporal
docker-compose exec temporal-admin-tools tctl cluster health
```

## Updating the System

### Rolling Updates (Recommended)

```bash
# Pull latest images
docker-compose pull

# Update services one by one to minimize downtime
docker-compose up -d --no-deps traefik
docker-compose up -d --no-deps redis
docker-compose up -d --no-deps postgres
docker-compose up -d --no-deps kafka
docker-compose up -d --no-deps activepieces
docker-compose up -d --no-deps superset
docker-compose up -d --no-deps metabase
docker-compose up -d --no-deps grafana
```

### Full Update

```bash
# Pull all latest images
docker-compose pull

# Restart all services
docker-compose up -d

# Verify all services are running
docker-compose ps
```

## Backup Procedures

### Database Backups

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# PostgreSQL backup
echo "Backing up PostgreSQL..."
docker-compose exec -T postgres pg_dumpall -U automation > $BACKUP_DIR/postgres_full.sql

# Individual database backups
for db in automation activepieces n8n metabase superset temporal; do
  docker-compose exec -T postgres pg_dump -U automation $db > $BACKUP_DIR/postgres_$db.sql
done

# ClickHouse backup
echo "Backing up ClickHouse..."
docker-compose exec -T clickhouse clickhouse-client --query "BACKUP DATABASE analytics TO '/var/lib/clickhouse/backup/analytics_$(date +%Y%m%d)'"

# Redis backup (RDB snapshot)
echo "Backing up Redis..."
docker-compose exec -T redis redis-cli -a redis_password BGSAVE
cp data/redis/dump.rdb $BACKUP_DIR/redis_dump.rdb

# Compress backup
echo "Compressing backup..."
tar -czf $BACKUP_DIR.tar.gz -C ./backups $(date +%Y-%m-%d)
rm -rf $BACKUP_DIR

echo "Backup complete: $BACKUP_DIR.tar.gz"
```

### Qdrant Backup

```bash
# Create snapshot
curl -X POST "http://localhost:6333/collections/your_collection/snapshots"

# List snapshots
curl "http://localhost:6333/collections/your_collection/snapshots"
```

### Workflow Configuration Backup

```bash
# Export Activepieces flows via API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8089/v1/flows > backups/activepieces_flows.json

# Export n8n workflows
docker-compose exec n8n n8n export:workflow --all --output=/data/workflows_backup.json
cp data/n8n/workflows_backup.json backups/
```

## Database Maintenance

### PostgreSQL

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U automation

# Check database sizes
SELECT datname, pg_size_pretty(pg_database_size(datname)) as size 
FROM pg_database ORDER BY pg_database_size(datname) DESC;

# Vacuum all databases
VACUUM ANALYZE;

# Identify large tables
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;

# Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

### ClickHouse

```bash
# Connect to ClickHouse
docker-compose exec clickhouse clickhouse-client

# Check table sizes
SELECT 
    database,
    table,
    formatReadableSize(sum(bytes)) as size
FROM system.parts
GROUP BY database, table
ORDER BY sum(bytes) DESC;

# Optimize tables
OPTIMIZE TABLE analytics.events FINAL;

# Check system metrics
SELECT metric, value FROM system.metrics;
```

### Redis

```bash
# Connect to Redis
docker-compose exec redis redis-cli -a redis_password

# Check memory usage
INFO memory

# Get key statistics
DBSIZE
INFO keyspace

# Find large keys
redis-cli -a redis_password --bigkeys

# Clear specific key patterns (careful!)
# KEYS "cache:*" | xargs redis-cli -a redis_password DEL
```

## Monitoring

### Grafana Dashboards

Access Grafana at http://localhost:3001 for real-time monitoring:

1. **System Overview**: CPU, memory, disk across all containers
2. **Kafka Metrics**: Message throughput, consumer lag
3. **PostgreSQL**: Connections, query performance
4. **Application Metrics**: Workflow executions, API latency

### Container Resource Monitoring

```bash
# Real-time container stats
docker stats

# Specific container resources
docker stats postgres clickhouse redis kafka

# Historical resource usage (if using Docker metrics)
docker-compose logs --tail=100 <service>
```

### Log Analysis

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f activepieces
docker-compose logs -f temporal

# Search for errors
docker-compose logs 2>&1 | grep -i error
docker-compose logs 2>&1 | grep -i "failed\|exception"

# Traefik access logs
docker-compose logs traefik | grep -v "200 OK"
```

## Troubleshooting

### Service Not Starting

```bash
# Check service logs
docker-compose logs <service>

# Restart specific service
docker-compose restart <service>

# Force recreate
docker-compose up -d --force-recreate <service>

# Check resource constraints
docker system df
docker system prune  # Clean up unused resources
```

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
docker-compose exec postgres pg_isready

# Check PostgreSQL logs
docker-compose logs postgres | tail -50

# Verify database exists
docker-compose exec postgres psql -U automation -l

# Check active connections
docker-compose exec postgres psql -U automation -c \
  "SELECT datname, numbackends FROM pg_stat_database;"
```

### Kafka Issues

```bash
# Check Kafka broker status
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# List topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups

# View Zookeeper status
docker-compose exec zookeeper echo stat | nc localhost 2181
```

### Temporal Workflow Issues

```bash
# Check cluster health
docker-compose exec temporal-admin-tools tctl cluster health

# List workflows
docker-compose exec temporal-admin-tools tctl workflow list

# Describe a workflow
docker-compose exec temporal-admin-tools tctl workflow describe -w <workflow_id>

# Reset a stuck workflow
docker-compose exec temporal-admin-tools tctl workflow reset -w <workflow_id> --reset_type LastDecisionCompleted
```

### Memory/Performance Issues

```bash
# Check container memory
docker stats --no-stream

# Identify memory-hungry processes
docker-compose exec <service> top -o %MEM

# Clear Redis cache
docker-compose exec redis redis-cli -a redis_password FLUSHDB

# Optimize PostgreSQL
docker-compose exec postgres psql -U automation -c "VACUUM ANALYZE;"
```

## Scaling

### Horizontal Scaling

For high-traffic deployments, consider:

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  activepieces:
    deploy:
      replicas: 3
  
  kafka:
    # Add more brokers
    environment:
      KAFKA_BROKER_ID: 2
```

### Resource Allocation

```yaml
# Increase resources for specific services
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

## Disaster Recovery

### Full System Recovery

```bash
# 1. Start fresh containers
docker-compose down -v
docker-compose up -d postgres redis

# 2. Restore PostgreSQL
cat backups/2024-01-01/postgres_full.sql | docker-compose exec -T postgres psql -U automation

# 3. Restore Redis
docker-compose stop redis
cp backups/2024-01-01/redis_dump.rdb data/redis/dump.rdb
docker-compose start redis

# 4. Start remaining services
docker-compose up -d

# 5. Verify restoration
docker-compose ps
./scripts/health-check.sh
```

### Point-in-Time Recovery

For critical databases, enable WAL archiving in PostgreSQL for point-in-time recovery capabilities.

## Additional Resources

- [Architecture Documentation](architecture.md)
- [Security Considerations](security.md)
- [Installation Guide](installation.md)
- [Workflow Documentation](workflows/README.md)

### External Documentation

- [Activepieces Docs](https://www.activepieces.com/docs)
- [Temporal Docs](https://docs.temporal.io/)
- [Apache Kafka Docs](https://kafka.apache.org/documentation/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [ClickHouse Docs](https://clickhouse.com/docs/)
- [Redis Docs](https://redis.io/docs/)

## Troubleshooting

### Common Issues and Solutions

#### n8n Not Starting

**Symptoms**: n8n container exits shortly after starting or shows errors in logs.

**Solutions**:

1. Check logs: `docker-compose logs n8n`
2. Verify database connection: `docker-compose exec postgres pg_isready`
3. Check file permissions: `ls -la data/n8n/`
4. Restart the container: `docker-compose restart n8n`

#### Webhook Connection Issues

**Symptoms**: Webhooks not receiving data or returning errors.

**Solutions**:

1. Verify network/firewall settings
2. Check webhook URL formatting
3. Test with curl commands:
   ```bash
   curl -X POST http://your-server-ip:5678/webhook/lead-capture \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com"}'
   ```

#### Database Connection Problems

**Symptoms**: Services unable to connect to PostgreSQL.

**Solutions**:

1. Check PostgreSQL status: `docker-compose logs postgres`
2. Verify credentials match across services
3. Ensure PostgreSQL is running: `docker-compose exec postgres pg_isready`
4. Restart PostgreSQL: `docker-compose restart postgres`

#### Workflow Execution Failures

**Symptoms**: Workflows fail to complete or show errors.

**Solutions**:

1. Check for syntax errors in function nodes
2. Verify file paths and permissions
3. Check for API rate limits
4. Check if disk space is full

## Scaling and Performance

### Optimizing n8n Performance

1. **Increase Resources**:
   - Edit `docker-compose.yml` to allocate more memory/CPU to n8n

2. **Optimize Workflows**:
   - Use batch processing for large datasets
   - Implement error handling in Function nodes
   - Add retry logic for external API calls

3. **Database Optimization**:
   - Regular vacuuming of PostgreSQL
   - Index frequently queried fields
   - Monitor query performance

### Scaling for Larger Deployments

For larger deployments, consider:

1. **Separate Database Server**:
   - Move PostgreSQL to a dedicated server
   - Implement database replication

2. **Load Balancing**:
   - Set up multiple n8n instances
   - Implement a load balancer

3. **Distributed File Storage**:
   - Use a networked file system for data
   - Consider object storage for large files

## Security Maintenance

### Regular Security Tasks

1. **Update SSL Certificates**:
   ```bash
   # For Let's Encrypt with Certbot
   certbot renew
   ```

2. **Check for Security Updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. **Review Access Logs**:
   ```bash
   # If using Nginx as reverse proxy
   tail -f /var/log/nginx/access.log
   ```

4. **Audit User Access**:
   - Review n8n and Metabase user accounts
   - Remove unnecessary access
   - Rotate credentials periodically

### Security Best Practices

1. **Keep Systems Updated**:
   - Apply updates promptly
   - Subscribe to security mailing lists

2. **Implement Proper Authentication**:
   - Enable n8n authentication
   - Use strong passwords
   - Consider implementing SSO

3. **Network Security**:
   - Use a firewall
   - Implement IP restrictions
   - Use HTTPS for all connections

4. **Data Security**:
   - Encrypt sensitive data
   - Implement backup encryption
   - Regular security audits

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Extending the System

### Adding New Workflows

1. **Design Phase**:
   - Identify the business process to automate
   - Map out the data flow and decision points
   - Determine required integrations

2. **Development**:
   - Create the workflow in n8n
   - Test with sample data
   - Document the workflow structure

3. **Deployment**:
   - Export the workflow as JSON
   - Add to version control
   - Import to production environment

### Creating Custom Dashboards

1. **Data Analysis**:
   - Identify key metrics to track
   - Determine data sources

2. **Dashboard Creation**:
   - Create a new dashboard in Metabase
   - Add relevant charts and visualizations
   - Configure refresh intervals

3. **Sharing and Access**:
   - Set up appropriate permissions
   - Share with stakeholders
   - Schedule email reports if needed

### Implementing Advanced Features

1. **AI Integration**:
   - Connect to open-source AI models
   - Implement text generation and analysis
   - Add image recognition capabilities

2. **Custom Notifications**:
   - Set up SMS notifications using open-source gateways
   - Configure email notifications for critical events
   - Implement webhook integrations with other systems

## Disaster Recovery

### Backup Strategy

1. **Regular Backups**:
   - Daily: Incremental backups of data directory
   - Weekly: Full backup of entire system
   - Monthly: Off-site backup storage

2. **Backup Verification**:
   - Regularly test backup integrity
   - Perform test restores
   - Document backup procedures

### Recovery Procedures

1. **Container Failure**:
   ```bash
   # Restart failed container
   docker-compose restart <container_name>
   
   # If restart fails, recreate the container
   docker-compose up -d --force-recreate <container_name>
   ```

2. **Complete System Failure**:
   ```bash
   # Clone the repository
   git clone https://github.com/ActivateLLC/open-source-business-automation.git
   
   # Restore from backup
   cp -r backups/<date>/data ./
   
   # Start the system
   docker-compose up -d
   ```

3. **Database Recovery**:
   ```bash
   # Restore PostgreSQL data
   docker-compose down
   rm -rf data/postgres
   cp -r backups/<date>/data/postgres ./data/
   docker-compose up -d
   ```

## Conclusion

Regular maintenance is essential for keeping your Open Source Business Automation Stack running smoothly. By following the guidelines in this document, you can ensure system stability, security, and optimal performance.

Remember to keep documentation updated as you make changes to the system, and always test modifications in a development environment before deploying to production.