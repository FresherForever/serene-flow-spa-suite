# Self-Hosted Database for Serene Flow Spa Suite

This guide provides instructions for setting up and maintaining a self-hosted PostgreSQL database for the Serene Flow Spa Suite application.

## Server Setup

### 1. Provision a Server

Choose a VPS provider (DigitalOcean, Linode, AWS, etc.) and provision a server with:
- Ubuntu 20.04 LTS or newer
- At least 2GB RAM
- 20GB+ SSD storage

### 2. Basic Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Set up a firewall
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow 5432/tcp  # PostgreSQL port
sudo ufw enable

# Set up fail2ban for additional security
sudo apt install -y fail2ban
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Enable and start service
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user for our application
psql -c "CREATE DATABASE serene_flow_db;"
psql -c "CREATE USER spa_admin WITH ENCRYPTED PASSWORD 'your_secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE serene_flow_db TO spa_admin;"

# Exit postgres user shell
exit

# Configure PostgreSQL for remote connections
sudo nano /etc/postgresql/12/main/postgresql.conf
```

Edit postgresql.conf to include:
```
listen_addresses = '*'
```

Then edit pg_hba.conf:
```bash
sudo nano /etc/postgresql/12/main/pg_hba.conf
```

Add this line (adjust for security):
```
host    all             all             0.0.0.0/0            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Database Synchronization

### Using the db-sync.ps1 Script

The included PowerShell script provides functionality to keep your local and remote databases in sync.

#### Push Local Database to Remote Server

```powershell
./db-sync.ps1 -Direction push -RemoteHost your-server-ip -RemoteUser spa_admin -RemoteDbName serene_flow_db -LocalDbName serene_flow_db
```

#### Pull Remote Database to Local

```powershell
./db-sync.ps1 -Direction pull -RemoteHost your-server-ip -RemoteUser spa_admin -RemoteDbName serene_flow_db -LocalDbName serene_flow_db
```

#### Push Only Database Schema

```powershell
./db-sync.ps1 -Direction schema-only -RemoteHost your-server-ip -RemoteUser spa_admin
```

## Backup Strategy

### Automated Backups

Set up a cron job for regular backups:

```bash
sudo -u postgres bash -c 'pg_dump -Fc serene_flow_db > /var/backups/serene_flow_db_$(date +%Y%m%d).dump'
```

Add to crontab:
```
0 2 * * * sudo -u postgres bash -c 'pg_dump -Fc serene_flow_db > /var/backups/serene_flow_db_$(date +%Y%m%d).dump'
```

### Rotating Backups

```bash
# Create a script to rotate backups
sudo nano /usr/local/bin/rotate-backups.sh
```

Content:
```bash
#!/bin/bash
# Keep only the last 7 daily backups
find /var/backups/ -name "serene_flow_db_*.dump" -type f -mtime +7 -exec rm {} \;
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/rotate-backups.sh
```

Add to crontab:
```
0 3 * * * /usr/local/bin/rotate-backups.sh
```

## Connecting to the Database

### From Vercel

In your Vercel project settings, set the following environment variable:

```
DATABASE_URL=postgresql://spa_admin:your_secure_password@your-server-ip:5432/serene_flow_db
```

The application is already configured to use this connection string when available.

### From Local Development Environment

For local testing with the remote database:

```powershell
$env:DATABASE_URL = "postgresql://spa_admin:your_secure_password@your-server-ip:5432/serene_flow_db"
npm run dev
```

## Monitoring and Maintenance

### Basic Monitoring

```bash
# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('serene_flow_db'));"

# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'serene_flow_db';"
```

### Performance Tuning

Adjust these PostgreSQL settings in postgresql.conf based on your server specs:

```
# Memory settings
shared_buffers = 512MB  # 25% of server RAM
work_mem = 16MB         # Adjust based on query complexity
maintenance_work_mem = 128MB

# Checkpoints
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9
```

Restart PostgreSQL after changes:
```bash
sudo systemctl restart postgresql
```

## Troubleshooting

### Connection Issues

1. Verify firewall settings:
   ```bash
   sudo ufw status
   ```

2. Check PostgreSQL is listening:
   ```bash
   sudo netstat -tuln | grep 5432
   ```

3. Verify pg_hba.conf settings:
   ```bash
   sudo cat /etc/postgresql/12/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
   ```

### Fixing Corrupted Tables

```bash
sudo -u postgres psql serene_flow_db -c "VACUUM FULL;"
```

### Recovery from Backup

```bash
# Restore from backup dump
sudo -u postgres pg_restore -d serene_flow_db /var/backups/serene_flow_db_YYYYMMDD.dump
```
