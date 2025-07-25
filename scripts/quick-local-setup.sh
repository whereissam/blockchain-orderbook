#!/bin/bash

# Quick Local Testnet Setup Script
# This script sets up everything needed for local development testing

set -e  # Exit on any error

echo "🚀 Quick Local Testnet Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Anvil is already running
check_anvil() {
    if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://127.0.0.1:8545 > /dev/null 2>&1; then
        print_status "Anvil is already running"
        return 0
    else
        return 1
    fi
}

# Start Anvil if not running
start_anvil() {
    if ! check_anvil; then
        print_info "Starting Anvil blockchain..."
        anvil --host 127.0.0.1 --port 8545 --accounts 10 --balance 10000 > anvil.log 2>&1 &
        ANVIL_PID=$!
        echo $ANVIL_PID > .anvil.pid
        
        # Wait for Anvil to start
        echo "Waiting for Anvil to start..."
        for i in {1..30}; do
            if check_anvil; then
                print_status "Anvil started successfully (PID: $ANVIL_PID)"
                break
            fi
            sleep 1
            if [ $i -eq 30 ]; then
                print_error "Anvil failed to start within 30 seconds"
                exit 1
            fi
        done
    fi
}

# Deploy contracts
deploy_contracts() {
    print_info "Deploying contracts..."
    
    export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    export ETHERSCAN_API_KEY=dummy
    
    if forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation > deploy.log 2>&1; then
        print_status "Contracts deployed successfully"
    else
        print_error "Contract deployment failed. Check deploy.log for details."
        exit 1
    fi
}

# Seed test data
seed_data() {
    print_info "Seeding test data..."
    
    export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    export ETHERSCAN_API_KEY=dummy
    
    if forge script script/Seed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --skip-simulation > seed.log 2>&1; then
        print_status "Test data seeded successfully"
    else
        print_error "Data seeding failed. Check seed.log for details."
        exit 1
    fi
}

# Run verification tests
run_tests() {
    print_info "Running verification tests..."
    
    if npm test -- --run simpleBlockchain.test.js > test.log 2>&1; then
        print_status "All tests passed"
    else
        print_warning "Some tests failed. Check test.log for details."
    fi
}

# Display final instructions
show_instructions() {
    echo ""
    echo "🎉 Local testnet setup complete!"
    echo "================================"
    echo ""
    echo "📋 Setup Summary:"
    echo "• Anvil blockchain running on http://127.0.0.1:8545"
    echo "• Chain ID: 31337"
    echo "• 10 test accounts with 10,000 ETH each"
    echo "• All contracts deployed and seeded"
    echo ""
    echo "🌐 Next Steps:"
    echo "1. Start the frontend:"
    echo "   npm run dev"
    echo ""
    echo "2. Configure MetaMask:"
    echo "   Network Name: Localhost 8545"
    echo "   RPC URL: http://127.0.0.1:8545"
    echo "   Chain ID: 31337"
    echo "   Currency Symbol: ETH"
    echo ""
    echo "3. Import test account:"
    echo "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo ""
    echo "4. Open frontend at http://localhost:3501"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "• Check setup: npm run check:frontend"
    echo "• Run tests: npm test"
    echo "• Stop Anvil: kill \$(cat .anvil.pid)"
    echo ""
    echo "📚 See LOCAL_TESTNET_GUIDE.md for detailed instructions"
}

# Main execution
main() {
    # Check prerequisites
    if ! command -v anvil &> /dev/null; then
        print_error "Anvil not found. Please install Foundry: https://getfoundry.sh/"
        exit 1
    fi
    
    if ! command -v forge &> /dev/null; then
        print_error "Forge not found. Please install Foundry: https://getfoundry.sh/"
        exit 1
    fi
    
    # Run setup steps
    start_anvil
    sleep 2  # Give Anvil a moment to fully initialize
    deploy_contracts
    seed_data
    run_tests
    show_instructions
    
    # Save setup info
    echo "Setup completed at: $(date)" > .setup-info
    echo "Anvil PID: $(cat .anvil.pid 2>/dev/null || echo 'N/A')" >> .setup-info
    echo "Contracts deployed: Yes" >> .setup-info
    echo "Test data seeded: Yes" >> .setup-info
}

# Handle cleanup on exit
cleanup() {
    if [ -f .anvil.pid ]; then
        print_info "Cleaning up..."
        # Note: We don't kill Anvil here so it keeps running for the user
        rm -f deploy.log seed.log test.log
    fi
}

trap cleanup EXIT

# Run main function
main "$@"