# 📋 FitTrack Logging System - Complete Index

Welcome to the FitTrack Logging System! This file will help you navigate all logging resources.

## 📖 Documentation Files

### 🚀 Start Here
- **`LOGGING_SETUP_SUMMARY.md`** — Overview of what was implemented (you should read this first!)

### 📚 Reference Guides
- **`LOGGING_GUIDE.md`** — Comprehensive logging documentation with examples
- **`LOGS_QUICK_REFERENCE.md`** — Quick commands and common searches

## 🔧 Configuration Files

### Backend
- **`src/main/resources/logback-spring.xml`** — Logback configuration (logging framework)
- **`src/main/resources/application.yml`** — Spring Boot logging settings

### Frontend
- **`src/utils/Logger.ts`** — Frontend logger utility class
- **`src/utils/loggingSetup.ts`** — Logging initialization and global functions
- **`src/main.tsx`** — Application entry point (logging initialized here)

## 💻 Source Code Files

### Backend Java Classes
- **`src/main/java/.../filter/ApiLoggingFilter.java`** — HTTP request/response logging filter
- **`src/main/java/.../util/AuditLogger.java`** — Business event logging utility
- **`src/main/java/.../controller/LogController.java`** — REST API for accessing logs

### Frontend TypeScript
- **`src/utils/Logger.ts`** — Logger class with storage support
- **`src/utils/loggingSetup.ts`** — Global logging setup and error handlers

## 📂 Log Files

All logs are stored in `logs/` directory:
```
logs/
├── fittrack.log              # All application events
├── fittrack-error.log        # Error-level events only
├── fittrack-api.log          # API requests and responses
└── fittrack-security.log     # Authentication and security events
```

Logs are automatically rotated and cleaned up every 30 days.

## 🎯 Quick Start

### 1. Start the Application

**Backend**:
```powershell
cd fittrack\apps\backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5433/fitness"
$env:DB_USERNAME="admin"
$env:DB_PASSWORD="admin"
.\mvnw.cmd spring-boot:run
```

**Frontend**:
```powershell
cd fittrack\apps\frontend
npm run dev
```

### 2. View Logs

**Backend Logs**:
```powershell
# Real-time monitoring
cd fittrack\logs
Get-Content fittrack.log -Tail 50 -Wait

# Or via API
curl http://localhost:1111/api/logs/fittrack.log/tail
```

**Frontend Logs**:
```javascript
// Open browser DevTools (F12) and type:
__getLogs()
```

### 3. Monitor Events

- **API Activity**: `logs/fittrack-api.log`
- **Security Events**: `logs/fittrack-security.log`
- **Errors**: `logs/fittrack-error.log`
- **Everything**: `logs/fittrack.log`

## 🔍 Common Tasks

### Search for Errors
```powershell
Select-String "ERROR" logs/fittrack-error.log
```

### Monitor API Performance
```powershell
Select-String "RESPONSE" logs/fittrack-api.log
```

### Check Authentication Events
```powershell
Select-String "SECURITY\|AUDIT" logs/fittrack-security.log
```

### Download Log Files
```bash
curl http://localhost:1111/api/logs/fittrack-error.log -o error.log
```

### View Frontend Logs
```javascript
__getLogs().filter(log => log.includes('ERROR'))
```

## 📊 Log Levels

| Level | Description |
|-------|-------------|
| DEBUG | Detailed information for debugging |
| INFO  | General informational messages |
| WARN  | Warning messages |
| ERROR | Error messages |

## 🔐 Security

- ✅ Logs NOT committed to git
- ✅ Authorization headers excluded from logs
- ✅ Automatic cleanup after 30 days
- ⚠️ Logs contain sensitive data - protect in production

## 🛠️ Troubleshooting

### Backend not logging?
1. Check `logs/` directory exists
2. Verify `logback-spring.xml` is in `src/main/resources/`
3. Restart backend application

### Frontend logs not working?
1. Check browser console (F12)
2. Verify logging initialized: check for "Logging system initialized"
3. Try `__getLogs()` in console

### Logs filling up disk?
1. Automatic cleanup runs daily
2. Old logs deleted after 30 days
3. Max total size per category is 500MB-1GB

## 📞 Need Help?

1. **Quick questions**: Check `LOGS_QUICK_REFERENCE.md`
2. **Detailed info**: See `LOGGING_GUIDE.md`
3. **Setup issues**: Read `LOGGING_SETUP_SUMMARY.md`
4. **Code questions**: Check source files in section above

## 🚀 REST API Endpoints

```bash
# List all logs
GET /api/logs

# Download log file
GET /api/logs/{filename}

# View last 100 lines
GET /api/logs/{filename}/tail

# Get statistics
GET /api/logs/stats
```

## 💡 Pro Tips

1. **Real-time monitoring**: Use PowerShell with `-Wait` flag
2. **Search efficiently**: Use `Select-String` or regex patterns
3. **Archive logs**: Create backups before cleanup
4. **Browser storage**: Frontend logs persist across page reloads
5. **Download frontend logs**: Use `__downloadLogs()` to save as file
6. **Debug mode**: Use `__logger.setLevel('DEBUG')` in browser console

## 📈 What Gets Logged

✅ HTTP requests and responses
✅ Authentication events (success/failure)
✅ Member operations (create, update, delete)
✅ Membership changes (create, renew, freeze)
✅ Check-in/check-out events
✅ Errors and exceptions
✅ Database operations
✅ Security violations
✅ API performance metrics
✅ Frontend user actions

## 🎓 Learning Resources

1. **Understanding Logs**: Start with `LOGGING_SETUP_SUMMARY.md`
2. **Practical Examples**: See `LOGS_QUICK_REFERENCE.md`
3. **Deep Dive**: Read `LOGGING_GUIDE.md`
4. **Implementation Details**: Review source files

## ✅ Verification

Both backend and frontend build successfully with logging enabled:
```
✅ Backend: BUILD SUCCESS (118 source files compiled)
✅ Frontend: built in 262ms (No errors)
```

---

**Ready to use!** Start your application and check the logs in `fittrack/logs/` directory.

**Last Updated**: September 5, 2026  
**Status**: ✅ Complete and Active

