#!/bin/bash

# Navigate to backend directory
cd /home/hrishikesh-ubuntu/AI-ecommerce/backend || exit

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000