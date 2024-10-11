#!/bin/bash

# Deploy backend
cd backend
npm install
npm run build
pm2 restart staging-backend

# Deploy frontend
cd ../frontend
npm install
npm run build
rsync -avzc build/ user@staging-server:/path/to/staging/frontend/

# Run smoke tests
npm run test:smoke