#!/bin/bash

# Keystore Setup Verification Script
# Run this to check if your environment is ready

echo "🔍 Keystore Setup Verification"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        if [ ! -z "$2" ]; then
            echo "  Version: $($1 $2 2>&1 | head -n 1)"
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

# Check prerequisites
echo "📋 Checking Prerequisites..."
echo ""

check_command "node" "--version"
check_command "npm" "--version"
check_command "rustc" "--version"
check_command "cargo" "--version"
check_command "solana" "--version"
check_command "anchor" "--version"

echo ""
echo "📁 Checking Project Structure..."
echo ""

check_dir "programs/keystore"
check_file "programs/keystore/Cargo.toml"
check_file "programs/keystore/src/lib.rs"
check_dir "app"
check_file "app/package.json"
check_file "app/src/app/page.tsx"

echo ""
echo "📦 Checking Dependencies..."
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Root dependencies not installed"
    echo "  Run: npm install"
fi

if [ -d "app/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo "  Run: cd app && npm install"
fi

echo ""
echo "🔧 Checking Solana Configuration..."
echo ""

if solana config get &> /dev/null; then
    echo -e "${GREEN}✓${NC} Solana CLI configured"
    echo "  RPC URL: $(solana config get | grep 'RPC URL' | cut -d: -f2-)"
    echo "  Wallet: $(solana config get | grep 'Keypair Path' | cut -d: -f2-)"
else
    echo -e "${RED}✗${NC} Solana CLI not configured"
fi

# Check if wallet has balance
if solana balance &> /dev/null; then
    BALANCE=$(solana balance | cut -d' ' -f1)
    echo -e "${GREEN}✓${NC} Wallet balance: $BALANCE SOL"
    if (( $(echo "$BALANCE < 1" | bc -l) )); then
        echo -e "${YELLOW}⚠${NC} Low balance. Run: solana airdrop 2"
    fi
else
    echo -e "${YELLOW}⚠${NC} Could not check wallet balance"
fi

echo ""
echo "🏗️  Checking Build Status..."
echo ""

if [ -f "target/deploy/keystore.so" ]; then
    echo -e "${GREEN}✓${NC} Program built"
    SIZE=$(ls -lh target/deploy/keystore.so | awk '{print $5}')
    echo "  Size: $SIZE"
else
    echo -e "${YELLOW}⚠${NC} Program not built yet"
    echo "  Run: anchor build"
fi

if [ -f "target/deploy/keystore-keypair.json" ]; then
    echo -e "${GREEN}✓${NC} Program keypair exists"
    PROGRAM_ID=$(solana address -k target/deploy/keystore-keypair.json)
    echo "  Program ID: $PROGRAM_ID"
else
    echo -e "${YELLOW}⚠${NC} Program keypair not found"
fi

echo ""
echo "================================"
echo ""

# Summary
ERRORS=0
if ! command -v node &> /dev/null; then ((ERRORS++)); fi
if ! command -v rustc &> /dev/null; then ((ERRORS++)); fi
if ! command -v solana &> /dev/null; then ((ERRORS++)); fi
if ! command -v anchor &> /dev/null; then ((ERRORS++)); fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. npm install (if not done)"
    echo "  2. cd app && npm install (if not done)"
    echo "  3. anchor build"
    echo "  4. anchor deploy --provider.cluster devnet"
    echo "  5. Update program IDs"
    echo "  6. cd app && npm run dev"
    echo ""
    echo "📖 See QUICKSTART.md for detailed instructions"
else
    echo -e "${RED}❌ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Please install missing prerequisites:"
    echo "  Node.js: https://nodejs.org"
    echo "  Rust: https://rustup.rs"
    echo "  Solana: https://docs.solana.com/cli/install-solana-cli-tools"
    echo "  Anchor: https://www.anchor-lang.com/docs/installation"
fi

echo ""

