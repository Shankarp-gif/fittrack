# FitTrack Logging Quick Reference

Quick commands to access and view logs.

## 📁 Log Files Location

```
fittrack/logs/
├── fittrack.log           # All logs
├── fittrack-error.log     # Errors only
├── fittrack-api.log       # API requests/responses
└── fittrack-security.log  # Auth/security events
```

## 🔍 View Logs

### Via File System (PowerShell)

```powershell
# Navigate to logs
cd fittrack\logs

# View latest logs
Get-Content fittrack.log -Tail 100

# Watch in real-time
Get-Content fittrack.log -Tail 50 -Wait

# Search for errors
Select-String "ERROR" fittrack-error.log

# Search by timestamp
Select-String "2026-09-05 10:15" fittrack.log
```

### Via REST API

```bash
# List all log files
curl http://localhost:1111/api/logs

# Download a log file
curl http://localhost:1111/api/logs/fittrack-error.log -o fittrack-error.log

# View last 100 lines
curl http://localhost:1111/api/logs/fittrack-api.log/tail

# Get log statistics
curl http://localhost:1111/api/logs/stats
```

### Via Browser (Frontend)

Open browser console (F12) and type:

```javascript
// View all frontend logs
__getLogs()

// Search for specific text
__getLogs().filter(log => log.includes('error'))

// Clear all logs
__clearLogs()

// Download as file
__downloadLogs()

// Change log level
__logger.setLevel('DEBUG')  // or 'INFO', 'WARN', 'ERROR'
```

## 📊 Log Levels

| Level | Symbol | Use Case |
|-------|--------|----------|
| DEBUG | 🔵 | Detailed info for troubleshooting |
| INFO  | ℹ️  | General informational messages |
| WARN  | ⚠️  | Warning messages (potential issues) |
| ERROR | ❌ | Errors and failures |

## 🚀 Starting Application with Logging

### Backend

```bash
# Development (Debug level)
cd fittrack\apps\backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5433/fitness"
$env:DB_USERNAME="admin"
$env:DB_PASSWORD="admin"
.\mvnw.cmd spring-boot:run
```

Logs output to: `logs/fittrack.log`, `logs/fittrack-api.log`, `logs/fittrack-security.log`

### Frontend

```bash
cd fittrack\apps\frontend
npm run dev
```

Logs output to: Browser console + Local Storage

## 🔐 Security Events to Monitor

### Check for authentication failures

```bash
Select-String "Authentication failed" logs/fittrack-security.log
```

### Check for unauthorized access

```bash
Select-String "Unauthorized access" logs/fittrack-security.log
```

### Check for errors

```bash
Select-String "ERROR" logs/fittrack-error.log
```

## 🧹 Cleanup & Maintenance

### Clear old logs manually

```bash
# Delete logs older than 30 days
Get-ChildItem "fittrack\logs\*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

### Clear frontend logs

```javascript
// In browser console
__clearLogs()
```

### Archive logs for backup

```bash
# Create a backup
$date = Get-Date -Format "yyyyMMdd"
Compress-Archive -Path "fittrack\logs\*" -DestinationPath "fittrack\logs-backup-$date.zip"
```

## 📈 Common Log Searches

### API Response Times

```bash
Select-String "RESPONSE" logs/fittrack-api.log | Select-Object -Last 50
```

### Failed API Calls

```bash
Select-String "RESPONSE.*[4-5][0-9][0-9]" logs/fittrack-api.log
```

### Database Errors

```bash
Select-String "Exception\|hibernate" logs/fittrack.log
```

### Member Activities

```bash
Select-String "AUDIT.*Member" logs/fittrack.log
```

### Payment Processing

```bash
Select-String "AUDIT.*Payment\|AUDIT.*Membership" logs/fittrack.log
```

## 🐛 Troubleshooting Checklist

- [ ] Check `logs/fittrack-error.log` for errors
- [ ] Check `logs/fittrack-api.log` for slow APIs
- [ ] Check `logs/fittrack-security.log` for auth issues
- [ ] Open browser console (F12) for frontend errors
- [ ] Use `__getLogs()` to view frontend logs
- [ ] Check `logs/fittrack.log` for general issues
- [ ] Verify all log files exist in `fittrack/logs/`
- [ ] Check file permissions on log directory

## 📚 Full Documentation

See `LOGGING_GUIDE.md` for comprehensive documentation.

## 🔗 Log API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | List all log files with sizes |
| `/api/logs/{filename}` | GET | Download specific log file |
| `/api/logs/{filename}/tail` | GET | View last 100 lines of log |
| `/api/logs/stats` | GET | Get log statistics |

## 💡 Tips

1. **Real-time monitoring**: Use PowerShell with `-Wait` flag
2. **Search efficiently**: Use grep/Select-String with specific keywords
3. **Archive logs**: Keep backups of important logs
4. **Browser storage**: Frontend logs persist across page reloads
5. **Download frontend logs**: Use `__downloadLogs()` to save as file
6. **Set log level**: Use `__logger.setLevel()` in browser console

---

**Last Updated**: 2026-09-05  
**For questions**: See LOGGING_GUIDE.md

