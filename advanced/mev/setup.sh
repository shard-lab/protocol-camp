#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directory structure
SHARED_DIR="./shared"
LOGS_DIR="./logs"

# Create directories if they don't exist
mkdir -p "$SHARED_DIR"
mkdir -p "$LOGS_DIR"

# File to store logs
ALL_LOGS="$LOGS_DIR/all_logs_$(date +%Y%m%d_%H%M%S).log"

# Function to echo with timestamp and color
log() {
  local COLOR=$1
  local MSG=$2
  echo -e "${COLOR}[$(date '+%Y-%m-%d %H:%M:%S')] $MSG${NC}" | tee -a "$ALL_LOGS"
}

# Function to check if Docker is running
check_docker() {
  log "$BLUE" "Checking if Docker is running..."
  
  # Try to get Docker version
  if ! docker info &> /dev/null; then
    log "$RED" "Docker is not running or not accessible. Please start Docker and try again."
    return 1
  fi
  
  log "$GREEN" "Docker is running and accessible."
  return 0
}

# Function to clean up old containers and images
cleanup() {
  log "$YELLOW" "Cleaning up old containers and images..."
  
  # Stop and remove containers
  docker compose down -v 2>/dev/null
  rm -rf ./shared/*
  
  # List and remove old images related to the project
  local old_images=$(docker images | grep "nth-caller-game-" | awk '{print $3}')
  if [ ! -z "$old_images" ]; then
    echo "$old_images" | xargs docker rmi -f 2>/dev/null
    log "$GREEN" "Removed old images."
  else
    log "$BLUE" "No old images to remove."
  fi
}

# Main execution starts here
log "$GREEN" "Starting Nth Caller Game environment..."

# Check if Docker is running
if ! check_docker; then
  log "$RED" "Exiting due to Docker not being available."
  exit 1
fi

# Clean up
cleanup

# Start containers and build them from scratch
log "$BLUE" "Building and starting containers..."
docker compose up -d --build anvil

# Wait for Anvil node to be ready
log "$YELLOW" "Waiting for Anvil node to be ready..."
max_retries=30
retry_count=0
while [ $retry_count -lt $max_retries ]; do
  if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null; then
    log "$GREEN" "Anvil node is ready!"
    break
  fi
  retry_count=$((retry_count + 1))
  log "$YELLOW" "Anvil node not ready yet, retrying ($retry_count/$max_retries)..."
  sleep 1
done

if [ $retry_count -eq $max_retries ]; then
  log "$RED" "Anvil node failed to start in time. Exiting."
  docker compose down
  exit 1
fi

# Deploy contracts
log "$BLUE" "Deploying smart contracts..."
docker compose up --build deployer


# Check if addresses.json was created
if [ ! -f "$SHARED_DIR/addresses.json" ]; then
  log "$RED" "Contract deployment failed: addresses.json not found. Exiting."
  docker compose down
  exit 1
fi

# Print contract addresses
log "$GREEN" "Contracts deployed successfully!"
log "$BLUE" "Contract addresses:"
cat "$SHARED_DIR/addresses.json"

# Start bots
log "$BLUE" "Starting caller bots..."
docker compose up -d --build caller-bot

# Wait for caller bot to be ready
log "$YELLOW" "Waiting for caller bot to initialize (10 seconds)..."
sleep 10

# Start game manager
log "$BLUE" "Starting game manager..."
docker compose up -d --build game-manager

# Show logs
log "$BLUE" "Starting log monitoring (Ctrl+C to stop)..."
docker compose logs -f caller-bot game-manager

# Cleanup on exit
trap cleanup EXIT