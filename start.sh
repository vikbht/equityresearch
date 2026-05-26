#!/bin/bash

# 🛡️ Aegis Equity Brief — Adaptive Port Finder & Monorepo Launcher
# Tailored for macOS (zsh/bash) with robust EADDRINUSE auto-evasion

# Color codes matching Aegis design system
COLOR_HEADER='\033[1;35m'  # Purple
COLOR_ACCENT='\033[1;36m'  # Cyan
COLOR_SUCCESS='\033[1;32m' # Green
COLOR_MUTED='\033[0;90m'   # Muted Grey
COLOR_RESET='\033[0m'

clear
echo -e "${COLOR_HEADER}🛡️  Aegis Equity Brief — Launching Adaptive Monorepo...${COLOR_RESET}"
echo -e "${COLOR_MUTED}Detecting network interfaces and port utilization...${COLOR_RESET}"
echo ""

# Helper function to check if a port is actively occupied
is_port_in_use() {
  lsof -i :"$1" >/dev/null 2>&1
}

# Helper function to find next available port starting from base
find_available_port() {
  local port=$1
  while is_port_in_use "$port"; do
    echo -e "  ${COLOR_MUTED}Port $port is currently in use. Evading...${COLOR_RESET}" >&2
    port=$((port + 1))
  done
  echo "$port"
}

# 1. Resolve Available Ports
echo -e "${COLOR_ACCENT}Scanning for available ports...${COLOR_RESET}"
BACKEND_PORT=$(find_available_port 5001)
echo -e "  ${COLOR_SUCCESS}✓ Backend allocated to port:${COLOR_RESET} ${COLOR_HEADER}$BACKEND_PORT${COLOR_RESET}"

FRONTEND_PORT=$(find_available_port 5173)
echo -e "  ${COLOR_SUCCESS}✓ Frontend allocated to port:${COLOR_RESET} ${COLOR_HEADER}$FRONTEND_PORT${COLOR_RESET}"
echo ""

echo -e "${COLOR_ACCENT}Configuration Summary:${COLOR_RESET}"
echo -e "  ${COLOR_MUTED}• API Endpoint:${COLOR_RESET} http://localhost:$BACKEND_PORT"
echo -e "  ${COLOR_MUTED}• Client UI:   ${COLOR_RESET} http://localhost:$FRONTEND_PORT"
echo ""

echo -e "${COLOR_HEADER}Starting servers concurrently... Press Ctrl+C to terminate.${COLOR_RESET}"
echo -e "${COLOR_MUTED}================================================================${COLOR_RESET}"

# 2. Spawn monorepo services with customized port environment configurations
npx concurrently \
  --names "Backend,Frontend" \
  --prefix-colors "magenta,cyan" \
  "PORT=$BACKEND_PORT npm run dev --prefix backend" \
  "PORT=$FRONTEND_PORT VITE_BACKEND_URL=http://localhost:$BACKEND_PORT npm run dev --prefix frontend"
