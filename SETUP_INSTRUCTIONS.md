# ThinkAIWorks Dashboard - Setup Instructions

## What I Fixed

✅ **Added User Seeding** - The seed script now creates admin and demo users
✅ **Improved Error Logging** - Better error messages so you can see exactly what's failing  
✅ **Added JWT_SECRET Validation** - Prevents undefined token signing errors
✅ **Added Login Error Logging** - Server now logs detailed errors when login fails

## Demo Credentials

Once MongoDB is connected, use these credentials to login:

- **Email:** `admin@thinkalworks.online`
- **Password:** `password123`

OR

- **Email:** `demo@thinkalworks.online`
- **Password:** `password123`

## MongoDB Setup (Required for Login to Work)

### Option 1: MongoDB Atlas (Cloud) - Recommended for Production

Your `.env` file already has MongoDB Atlas configured:
```
MONGO_URI=mongodb+srv://johndavidhendrick3_db_user:Basit123*@cluster0.rohidhl.mongodb.net/thinkaiworksonline?retryWrites=true&w=majority
```

**If you're getting connection errors:**
- Check your internet connection
- Verify the MongoDB Atlas cluster is active at: https://cloud.mongodb.com/
- Check if your IP is whitelisted in MongoDB Atlas (IP Whitelist section)
- Verify the credentials are correct

### Option 2: MongoDB Local (Development) - Quickest Setup

If you want to run MongoDB locally:

**Windows:**
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer and accept defaults
3. MongoDB will start automatically
4. Update `.env` to use local connection:
   ```
   MONGO_URI=mongodb://localhost:27017/thinkaiworks
   ```

**Mac/Linux:**
```bash
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb-org  # Linux
mongod  # Start MongoDB
```

## Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   npm install  # If dependencies not installed
   npm run seed  # Seed the database with users and sample data
   npm run dev  # Start development server
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install  # If dependencies not installed
   npm run dev  # Start development server
   ```

3. **Open in Browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Troubleshooting

**Issue: "MongoDB connection failed"**
- Solution: Follow Option 1 or 2 above to set up MongoDB

**Issue: Login returns 500 error**
- Check backend console for detailed error logs
- Ensure MongoDB is running and accessible
- Run `npm run seed` to create admin user

**Issue: "Server running on port 5001"**
- This means port 5000 is in use by another process
- Either:
  - Kill the process using port 5000: `taskkill /PID <pid> /F`
  - Or update frontend `.env` to use port 5001:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5001
    ```

**Issue: "JWT_SECRET is not set"**
- The `.env` file in backend should have JWT_SECRET
- Check that it's not empty
- Restart the backend server after updating `.env`

## Next Steps

After setting up MongoDB and confirming login works:

1. ✅ Database is ready
2. ✅ Users can authenticate
3. Next: Configure other features (CRM, budgets, etc.)
