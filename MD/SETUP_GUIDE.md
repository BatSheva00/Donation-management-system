# 🚀 KindLoop - Quick Setup Guide

## What You Need to Download

### 1. Node.js (Required)
**Version**: 20.0.0 or higher

**Download**: https://nodejs.org/

**Installation**:
- Download the LTS (Long Term Support) version
- Run the installer
- Follow the installation wizard
- This will also install npm (Node Package Manager)

**Verify Installation**:
```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show v10.x.x or higher
```

---

### 2. Docker Desktop (Required)
**Download**: https://www.docker.com/products/docker-desktop/

**Installation**:
- Download for your operating system (Windows/Mac/Linux)
- Run the installer
- Follow the installation wizard
- Docker Compose is included with Docker Desktop

**Verify Installation**:
```bash
docker --version           # Should show Docker version 20.x.x or higher
docker-compose --version   # Should show v2.x.x or higher
```

---

### 3. Git (Required)
**Download**: https://git-scm.com/downloads

**Installation**:
- Download for your operating system
- Run the installer
- Use default settings

**Verify Installation**:
```bash
git --version    # Should show git version 2.x.x or higher
```

---

### 4. Code Editor (Recommended)
**Visual Studio Code**: https://code.visualstudio.com/

**Recommended Extensions**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Docker
- MongoDB for VS Code

---

### 5. API Keys (Required for Full Functionality)

#### Google Maps API Key
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key
6. **Important**: Set restrictions (HTTP referrers for production)

**Cost**: Free tier includes:
- $200 monthly credit
- Sufficient for development and testing

#### Stripe Test API Keys
1. Go to: https://dashboard.stripe.com/register
2. Create a free account
3. Go to "Developers" → "API keys"
4. Toggle "Viewing test data" (top right)
5. Copy both:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

**Cost**: Completely FREE for testing
- No credit card required for test mode
- No real money transactions

---

## Quick Start Commands

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd kindloop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Configure Environment Variables
```bash
# Create backend .env file
cd backend
cp .env.example .env
# Edit .env and add your API keys

# Create frontend .env file
cd ../frontend
cp .env.example .env
# Edit .env and add your API keys
cd ..
```

### Step 3: Run with Docker
```bash
# From project root
docker-compose up
```

**Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Step 4: Create Your First User
1. Open http://localhost:5173
2. Click "Register"
3. Fill in the form
4. Select your role (User, Business, Driver, or Packer)
5. Click "Sign Up"
6. Login with your credentials

---

## What Ports Are Used?

| Service  | Port  | URL |
|----------|-------|-----|
| Frontend | 5173  | http://localhost:5173 |
| Backend  | 5000  | http://localhost:5000 |
| MongoDB  | 27017 | localhost:27017 |

**Note**: Make sure these ports are available (not used by other applications)

---

## Common Installation Issues

### Windows Users

#### Issue: npm install fails with permission errors
**Solution**: Run PowerShell or CMD as Administrator

#### Issue: Docker Desktop won't start
**Solution**: 
1. Enable WSL 2 (Windows Subsystem for Linux)
2. Enable Virtualization in BIOS
3. Restart computer

### Mac Users

#### Issue: Cannot install packages globally
**Solution**: Use `sudo npm install -g <package>`

#### Issue: Docker Desktop requires macOS 11 or newer
**Solution**: Update macOS or use Docker Toolbox for older versions

### Linux Users

#### Issue: Permission denied when running Docker
**Solution**: Add your user to the docker group
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Development Tools (Optional but Recommended)

### MongoDB Compass
**What**: GUI for MongoDB
**Download**: https://www.mongodb.com/try/download/compass
**Use**: View and manage database visually

### Postman
**What**: API testing tool
**Download**: https://www.postman.com/downloads/
**Use**: Test API endpoints

### React Developer Tools
**What**: Browser extension for debugging React
**Download**: 
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org/en-US/firefox/

---

## Verification Checklist

Before running the application, verify:

- [ ] Node.js installed (v20+)
- [ ] npm installed (v10+)
- [ ] Docker Desktop installed and running
- [ ] Docker Compose available
- [ ] Git installed
- [ ] Code editor installed
- [ ] Google Maps API key obtained
- [ ] Stripe test API keys obtained
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Environment variables configured (.env files)
- [ ] Ports 5173, 5000, and 27017 are available

---

## Next Steps

After setup:
1. Read [README.md](./README.md) for detailed documentation
2. Check [DESIGN.md](./DESIGN.md) for architecture overview
3. Explore the codebase
4. Start developing!

---

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting section in README.md](./README.md#-troubleshooting)
2. Search for the error message online
3. Check Docker Desktop logs
4. Review the application logs in the terminal

---

## Useful Commands Reference

```bash
# Start everything with Docker
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# Remove all containers and volumes
docker-compose down -v

# Check if ports are available (Windows)
netstat -ano | findstr :5173
netstat -ano | findstr :5000
netstat -ano | findstr :27017

# Check if ports are available (Mac/Linux)
lsof -ti:5173
lsof -ti:5000
lsof -ti:27017
```

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 11+, or Linux
- **RAM**: 8 GB
- **Storage**: 5 GB free space
- **CPU**: 2 cores, 2.0 GHz

### Recommended Requirements
- **RAM**: 16 GB
- **Storage**: 10 GB free space
- **CPU**: 4 cores, 2.5 GHz

---

## Estimated Setup Time

| Task | Time |
|------|------|
| Download & install Node.js | 5 minutes |
| Download & install Docker Desktop | 10 minutes |
| Clone repository | 2 minutes |
| Install dependencies | 5-10 minutes |
| Configure environment | 5 minutes |
| Obtain API keys | 10 minutes |
| First run with Docker | 5 minutes |
| **Total** | **~45 minutes** |

---

<div align="center">

**You're all set! Happy coding! 🚀**

</div>






