#!/usr/bin/env bash

# This script is designed to be run on the Proxmox VE Host.
# It creates a Debian 12 LXC container, installs Node.js, and prepares the environment for the All Boys App.

CT_ID=${1:-105}
HOSTNAME=${2:-"all-boys-app"}
PASSWORD=${3:-"admin123"}
STORAGE=${4:-"local-lvm"}
MEMORY=2048
CORES=2
SWAP=512

echo "Creating LXC Container $CT_ID ($HOSTNAME)..."

pveam update
TEMPLATE=$(pveam available | grep debian-12 | head -n 1 | awk '{print $2}')

if [ -z "$TEMPLATE" ]; then
  echo "Debian 12 template not found. Please download it manually."
  exit 1
fi

pveam download local "$TEMPLATE" || echo "Template might already exist."

pct create $CT_ID local:vztmpl/$(basename $TEMPLATE) \
  --hostname $HOSTNAME \
  --password $PASSWORD \
  --storage $STORAGE \
  --memory $MEMORY \
  --swap $SWAP \
  --cores $CORES \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp,type=veth \
  --features nesting=1 \
  --unprivileged 1 \
  --start 1

echo "Container started. Waiting for network..."
sleep 10

echo "Installing Dependencies inside Container..."

pct exec $CT_ID -- bash -c "apt-get update && apt-get install -y curl git build-essential"

# Install Node.js (LTS)
pct exec $CT_ID -- bash -c "curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -"
pct exec $CT_ID -- bash -c "apt-get install -y nodejs"

# Install PM2
pct exec $CT_ID -- bash -c "npm install -g pm2"

echo "Environment Ready!"
echo "To deploy the app:"
echo "1. Push your code to a git repo."
echo "2. Run: pct exec $CT_ID -- git clone <your-repo-url> /opt/all-boys-app"
echo "3. Run: pct exec $CT_ID -- cd /opt/all-boys-app && npm install && npm run build && pm2 start npm --name 'app' -- start"
