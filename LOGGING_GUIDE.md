# FitTrack Logging Guide

Complete logging documentation for the FitTrack Gym Management SaaS platform.

## Overview

The FitTrack application implements comprehensive logging across both backend and frontend to help you monitor, debug, and troubleshoot the system.

## Backend Logging (Java/Spring Boot)

### Log Files Location

All backend logs are stored in the `logs/` directory at the project root:

```
logs/
├── fittrack.log              # All application logs (rotating)
├── fittrack-error.log        # Error-level logs only
├── fittrack-api.log          # API request/response logs
├── fittrack-security.log     # Authentication/security events
└── fittrack-*.log            # Rotated historical logs
```

### Log Rotation Policy

- **Max File Size**: 10MB per file
- **Max History**: 30 days of logs retained
- **Max Total Size**: 1GB (error logs), varies by category
- **Format**: `fittrack-YYYY-MM-DD.N.log` (N = rotation number)

### Log Configuration

Edit `src/main/resources/logback-spring.xml` to customize:

```xml
<property name="LOG_FILE_PATH" value="logs"/>
<property name="LOG_FILE_MAX_SIZE" value="10MB"/>
<property name="LOG_FILE_MAX_HISTORY" value="30"/>
```

### Log Levels by Component

- **Root Logger**: `INFO` level
- **com.fittrack.backend**: `INFO` level
- **com.fittrack.backend.controller**: `DEBUG` (file: fittrack-api.log)
- **com.fittrack.backend.security**: `DEBUG` (file: fittrack-security.log)
- **org.springframework.security**: `DEBUG`
- **org.springframework.web**: `INFO` (file: fittrack-api.log)
- **org.hibernate**: `WARN`

### Setting Log Level by Profile

**Development Profile** (`-Dspring.profiles.active=dev`):
```
All loggers: DEBUG level
Console + File output enabled
Verbose request/response logging
```

**Production Profile** (`-Dspring.profiles.active=prod`):
```
All loggers: WARN level
Console disabled (file output only)
Reduced I/O overhead
```

## Backend Log API

Access logs programmatically via REST endpoints:

### List Available Log Files

```bash
GET /api/logs
```

Response:
```json
{
  "success": true,
  "message": "Log files retrieved",
  "data": [
    "fittrack.log (5.2 MB)",
    "fittrack-error.log (1.1 MB)",
    "fittrack-api.log (3.8 MB)",
    "fittrack-security.log (2.3 MB)"
  ]
}
```

### Download Log File

```bash
GET /api/logs/{filename}
```

Example:
```bash
curl http://localhost:1111/api/logs/fittrack.log --output fittrack.log
```

### View Last 100 Lines of Log

```bash
GET /api/logs/{filename}/tail
```

Example:
```bash
curl http://localhost:1111/api/logs/fittrack-error.log/tail
```

### Get Log Statistics

```bash
GET /api/logs/stats
```

Response:
```json
{
  "success": true,
  "data": "Log Files: 4, Total Size: 12.4 MB"
}
```

## Backend Audit Logging

Use the `AuditLogger` utility for application-level events:

```java
@Autowired
private AuditLogger auditLogger;

// Log member creation
auditLogger.logMemberCreated(memberId, memberName);

// Log membership renewal
auditLogger.logMembershipRenewed(newMembershipId, oldMembershipId);

// Log authentication
auditLogger.logAuthenticationSuccess(email);
auditLogger.logAuthenticationFailure(email, "Invalid password");

// Log data modifications
auditLogger.logDataModification("Member", memberId, "UPDATE", "Height changed: 175->180");

// Log errors
auditLogger.logError("Failed to process payment", exception);
```

### Audit Events Logged

- Member creation/updates
- Membership creation/renewal
- Check-in/check-out
- Authentication success/failure
- Unauthorized access attempts
- Payment processing
- System errors
- Data modifications

## Frontend Logging (Browser)

### Browser Console Logging

The frontend logs are automatically captured to the browser console. Open browser developer tools:

- **Chrome**: F12 or Ctrl+Shift+I
- **Firefox**: F12 or Ctrl+Shift+I
- **Safari**: Cmd+Option+I

Log output format:
```
[2026-09-05T10:15:30.123Z] DEBUG: API call to /api/members completed
[2026-09-05T10:15:31.456Z] ERROR: Failed to load dashboard {"status":403}
```

### Browser Storage Logging

Frontend logs are also stored in **Browser Local Storage** (last 500 logs):

Access via browser console:
```javascript
// Get all stored logs
__getLogs()

// Clear stored logs
__clearLogs()

// Download logs as file
__downloadLogs()

// Set log level
__logger.setLevel('DEBUG')  // DEBUG, INFO, WARN, ERROR
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARN**: Warning messages (potential issues)
- **ERROR**: Error messages (failures)

### Manual Logging in React

```typescript
import { logger } from '../utils/Logger'

// Info
logger.info('Member profile updated', { memberId: 123 })

// Warning
logger.warn('API response slow', { duration: 5000 })

// Error
logger.error('Failed to load data', error)

// Debug
logger.debug('Form validation passed')
```

## Viewing Logs

### Local File System

Navigate to the `logs/` directory:

```bash
# Windows
cd fittrack\logs

# macOS/Linux
cd fittrack/logs

# View latest log
cat fittrack.log | tail -100

# Search for errors
grep ERROR fittrack.log

# Search by timestamp
grep "2026-09-05 10:15" fittrack.log
```

### Using `tail` Command

```bash
# Watch log in real-time
tail -f logs/fittrack.log

# Watch errors only
tail -f logs/fittrack-error.log

# Last 50 lines
tail -50 logs/fittrack.log
```

### Using Log API

```bash
# Download latest errors
curl http://localhost:1111/api/logs/fittrack-error.log -o error.log

# View API logs (last 100 lines)
curl http://localhost:1111/api/logs/fittrack-api.log/tail

# Get stats
curl http://localhost:1111/api/logs/stats
```

### Browser Developer Tools

Open browser console (F12):

```javascript
// View all frontend logs
__getLogs()

// Search logs
__getLogs().filter(log => log.includes('error'))

// Download logs
__downloadLogs()
```

## Common Log Patterns

### Successful API Call

```
[2026-09-05 10:15:30.123] REQUEST[abc12345] GET /api/members from 127.0.0.1
  Header: Authorization = Bearer eyJ...
  Header: Content-Type = application/json
[2026-09-05 10:15:30.456] RESPONSE[abc12345] GET - 200 - 333ms
```

### Authentication Failure

```
[2026-09-05 10:15:45.123] SECURITY: Authentication failed - Email: user@example.com, Reason: Invalid password
[2026-09-05 10:15:45.456] REQUEST[abc12346] POST /api/auth/login from 192.168.1.100
[2026-09-05 10:15:45.789] RESPONSE[abc12346] POST - 401 - 123ms
```

### Database Error

```
[2026-09-05 10:16:00.123] ERROR: Failed to load member - ID: 999
java.lang.IllegalArgumentException: Member not found
  at com.fittrack.backend.service.MemberService.getMember(MemberService.java:45)
  ...
```

### Member Created

```
[2026-09-05 10:16:15.123] AUDIT: Member created - ID: 150, Name: Raj Kumar
[2026-09-05 10:16:15.456] AUDIT: Data modification - Entity: Member, ID: 150, Action: CREATE, Details: New member from lead
```

## Troubleshooting with Logs

### Issue: "Cannot reach server"

1. Check `fittrack-error.log` for server startup errors
2. Check `fittrack-api.log` for connection issues
3. Verify backend is running: `curl http://localhost:1111/actuator/health`

### Issue: "401 Unauthorized"

1. Check `fittrack-security.log` for auth failures
2. Review token expiration in logs
3. Check browser console for JWT issues: `__getLogs().filter(l => l.includes('AUTH'))`

### Issue: "Member not found"

1. Search `fittrack.log` for: `grep "Member created" fittrack.log`
2. Check member ID in database: `SELECT * FROM members WHERE id = XXX;`
3. Review error stack trace in `fittrack-error.log`

### Issue: "Slow API response"

1. Check `fittrack-api.log` for response times
2. Search for slow queries: `grep "ms" fittrack-api.log | awk '{print $(NF-1)}'`
3. Review database indexes and SQL performance

## Log Retention & Cleanup

### Automatic Cleanup

Logs are automatically rotated and old files are deleted after 30 days.

### Manual Cleanup

```bash
# Delete old log files
rm logs/fittrack-*.log

# Keep current day only
find logs -name "fittrack*.log" -mtime +1 -delete

# Archive logs
tar czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Clear Browser Logs

```javascript
// Clear frontend logs from browser storage
__clearLogs()

// Clear browser cache
// Chrome: Ctrl+Shift+Delete → Clear browsing data
// Firefox: Ctrl+Shift+Delete → Clear Recent History
```

## Log Security

⚠️ **Important**: Logs may contain:
- User email addresses
- API request details
- Error messages with sensitive data
- Database connection strings

**Never commit logs to version control**:
```
.gitignore
logs/
*.log
```

**Protect log files in production**:
- Restrict file system access
- Use encryption for stored logs
- Implement log aggregation service
- Monitor log access

## Performance Considerations

- **File I/O**: Logging adds ~5-10% overhead
- **Storage**: Expect ~100-200MB logs per week under normal load
- **Memory**: Browser stores last 500 logs (~2-5MB)

### Optimize Logging

**Development**:
```yaml
logging.level.root: DEBUG
logging.level.org.springframework.web: DEBUG
```

**Production**:
```yaml
logging.level.root: WARN
logging.level.org.springframework.web: INFO
```

## Integration with Monitoring Tools

### Send Logs to External Service

Create a custom log appender in `logback-spring.xml`:

```xml
<appender name="LOGSTASH" class="...">
  <!-- Configure Logstash/ELK integration -->
</appender>
```

### Cloud Logging Services

- AWS CloudWatch
- Google Cloud Logging
- Splunk
- Datadog
- New Relic

## References

- **Logback Configuration**: `src/main/resources/logback-spring.xml`
- **Audit Logger Utility**: `src/main/java/com/fittrack/backend/util/AuditLogger.java`
- **Frontend Logger**: `src/utils/Logger.ts`
- **Log Controller**: `src/main/java/com/fittrack/backend/controller/LogController.java`

---

**Version**: 1.0  
**Last Updated**: 2026-09-05  
**Maintained by**: FitTrack Development Team

