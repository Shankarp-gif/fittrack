# FitTrack Logging System - Implementation Summary

## ✅ What's Been Set Up

A comprehensive logging infrastructure has been implemented for both backend and frontend to help you monitor, debug, and troubleshoot the FitTrack application.

## 📦 Backend Logging Components

### 1. **Logback Configuration** (`logback-spring.xml`)
- Configured 4 log files with automatic rotation:
  - `fittrack.log` — All application logs
  - `fittrack-error.log` — Error-level logs only
  - `fittrack-api.log` — API requests/responses
  - `fittrack-security.log` — Authentication/security events
- Automatic cleanup after 30 days
- Max file size: 10MB per log file
- Total storage cap: 1GB

### 2. **API Logging Filter** (`ApiLoggingFilter.java`)
- Automatically logs all HTTP requests and responses
- Includes:
  - Request method, path, client IP
  - Response status code, response time
  - Request headers (excluding Authorization for security)
  - Unique request ID for tracing

### 3. **Audit Logger Utility** (`AuditLogger.java`)
- High-level logging for business events:
  - Member creation/updates
  - Membership operations
  - Check-in/check-out events
  - Authentication events
  - Data modifications
  - Error tracking

### 4. **Log Controller** (`LogController.java`)
REST endpoints to access logs programmatically:
- `GET /api/logs` — List all log files with sizes
- `GET /api/logs/{filename}` — Download a log file
- `GET /api/logs/{filename}/tail` — View last 100 lines
- `GET /api/logs/stats` — Get log statistics

## 🌐 Frontend Logging Components

### 1. **Logger Utility** (`Logger.ts`)
- Console logging with 4 levels (DEBUG, INFO, WARN, ERROR)
- Automatic storage in browser LocalStorage (last 500 logs)
- Download logs as file
- Search and filter capabilities

### 2. **Logging Setup** (`loggingSetup.ts`)
- Global error handler for uncaught exceptions
- Global unhandled promise rejection handler
- Page load tracking
- Sets up global functions in browser console

### 3. **Browser Console API**
Access via browser Developer Tools (F12):
- `__getLogs()` — View all frontend logs
- `__clearLogs()` — Clear stored logs
- `__downloadLogs()` — Download logs as file
- `__logger.setLevel('DEBUG')` — Change log level

## 📂 Log Files Location

```
fittrack/
├── logs/
│   ├── fittrack.log              # Main application log
│   ├── fittrack-error.log        # Errors only
│   ├── fittrack-api.log          # API requests/responses
│   └── fittrack-security.log     # Auth/security events
├── LOGGING_GUIDE.md              # Comprehensive guide
└── LOGS_QUICK_REFERENCE.md       # Quick commands
```

## 🚀 How to Use Logging

### Start Backend with Logging

```powershell
cd fittrack\apps\backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5433/fitness"
$env:DB_USERNAME="admin"
$env:DB_PASSWORD="admin"
.\mvnw.cmd spring-boot:run
```

Logs will be written to `fittrack/logs/` directory.

### View Backend Logs in Real-Time

**PowerShell**:
```powershell
cd fittrack\logs
Get-Content fittrack.log -Tail 50 -Wait
```

**REST API**:
```bash
curl http://localhost:1111/api/logs/fittrack.log/tail
```

**Browser** (in developer console):
```javascript
fetch('http://localhost:1111/api/logs/fittrack.log/tail')
  .then(r => r.json())
  .then(data => console.table(data.data))
```

### View Frontend Logs

Open browser Developer Tools (F12) and type:

```javascript
// View all logs
__getLogs()

// Search for errors
__getLogs().filter(log => log.includes('ERROR'))

// Download as file
__downloadLogs()

// Set to debug mode
__logger.setLevel('DEBUG')
```

## 📊 Log Examples

### API Request/Response Log

```
[2026-09-05 10:15:30.123] REQUEST[abc12345] GET /api/members from 127.0.0.1
[2026-09-05 10:15:30.456] RESPONSE[abc12345] GET - 200 - 333ms
```

### Security Event Log

```
[2026-09-05 10:16:00.123] SECURITY: Authentication success - Email: user@example.com
[2026-09-05 10:16:15.456] AUDIT: Member created - ID: 150, Name: Raj Kumar
```

### Error Log

```
[2026-09-05 10:17:00.123] ERROR: Failed to load member - ID: 999
java.lang.IllegalArgumentException: Member not found
  at com.fittrack.backend.service.MemberService.getMember(MemberService.java:45)
```

## 🔒 Security Notes

- ⚠️ Logs contain sensitive information (emails, API details)
- ✅ Logs are NOT committed to git (added to .gitignore)
- ✅ Authorization headers are excluded from request logs
- ✅ Logs are rotated automatically after 30 days
- 🔐 Protect log files in production

## 📚 Documentation Files

1. **`LOGGING_GUIDE.md`** — Comprehensive logging documentation
   - Full API reference
   - Configuration details
   - Troubleshooting guide
   - Integration with external services

2. **`LOGS_QUICK_REFERENCE.md`** — Quick commands and tips
   - Common log searches
   - Troubleshooting checklist
   - PowerShell commands
   - Cleanup procedures

## 🔍 Quick Troubleshooting

### "Cannot reach server"
1. Check `logs/fittrack-error.log` for startup errors
2. Check backend is running: `curl http://localhost:1111/actuator/health`

### "401 Unauthorized"
1. Check `logs/fittrack-security.log` for auth failures
2. Check browser console: `__getLogs().filter(l => l.includes('AUTH'))`

### "Member not found"
1. Check `logs/fittrack.log` for member creation
2. Review database: `SELECT * FROM members WHERE id = XXX;`

### "Slow API response"
1. Check `logs/fittrack-api.log` for response times
2. Search for slow queries with long response times

## 🛠️ Customization

### Change Log Level

**Development** (very verbose):
```yaml
# application-dev.yml
logging.level.root: DEBUG
```

**Production** (minimal):
```yaml
# application-prod.yml
logging.level.root: WARN
```

### Change Log Location

Edit `logback-spring.xml`:
```xml
<property name="LOG_FILE_PATH" value="logs"/>  <!-- Change this path -->
```

### Add Custom Logging

In Java:
```java
@Autowired
private AuditLogger auditLogger;

auditLogger.logMemberCreated(memberId, "John Doe");
```

In Frontend:
```javascript
import { logger } from '../utils/Logger'
logger.info('Member profile loaded', { id: 123 })
```

## 📈 Log Storage & Rotation

- **Max File Size**: 10MB
- **Max History**: 30 days
- **Max Total**: ~1GB (varies by category)
- **Automatic Cleanup**: Enabled
- **Rotation Format**: `fittrack-YYYY-MM-DD.N.log`

## ✨ Features

✅ Automatic log rotation and cleanup
✅ Multiple log files by category
✅ REST API to access logs
✅ Frontend browser storage
✅ Real-time log download
✅ Search and filter capabilities
✅ Security event tracking
✅ API performance monitoring
✅ Error aggregation
✅ Database query logging

## 🎯 Next Steps

1. **Start the application**:
   ```powershell
   .\mvnw.cmd spring-boot:run
   npm run dev
   ```

2. **Access logs**:
   - Backend: `fittrack/logs/fittrack.log`
   - API: `http://localhost:1111/api/logs`
   - Frontend: Browser console F12, then `__getLogs()`

3. **Monitor events**:
   - Check security logs for auth events
   - Check API logs for performance
   - Check error logs for issues

4. **Refer to guides**:
   - Quick reference: `LOGS_QUICK_REFERENCE.md`
   - Full guide: `LOGGING_GUIDE.md`

## 📞 Support

For logging issues or customization needs, refer to:
- `LOGGING_GUIDE.md` — Comprehensive reference
- `logback-spring.xml` — Logging configuration
- `AuditLogger.java` — Event logging
- `Logger.ts` — Frontend logging
- `LogController.java` — REST API

---

**Status**: ✅ Complete and Verified
**Backend Build**: ✅ SUCCESS
**Frontend Build**: ✅ SUCCESS  
**Logging System**: ✅ Active and Ready to Use

You can now start the application and all events will be automatically logged!

