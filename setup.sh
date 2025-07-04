#!/bin/bash

# Hedera Counter DApp Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up Hedera Counter DApp..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy main environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env with your Hedera credentials"
    else
        print_warning ".env file already exists"
    fi
    
    # Copy frontend environment file if it doesn't exist
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/.env.local.example frontend/.env.local
        print_success "Created frontend/.env.local file from template"
    else
        print_warning "frontend/.env.local file already exists"
    fi
}

# Install root dependencies
install_root_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install smart contract dependencies
install_contract_dependencies() {
    print_status "Installing smart contract dependencies..."
    cd smart-contract
    npm install
    cd ..
    print_success "Smart contract dependencies installed"
}

# Install frontend dependencies
install_frontend_dependencies() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Compile smart contract
compile_contract() {
    print_status "Compiling smart contract..."
    cd smart-contract
    npx hardhat compile
    cd ..
    print_success "Smart contract compiled successfully"
}

# Run smart contract tests
test_contract() {
    print_status "Running smart contract tests..."
    cd smart-contract
    npm test
    cd ..
    print_success "Smart contract tests passed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend application..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🔑 Configure your Hedera credentials:"
    echo "   - Edit .env file with your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY"
    echo "   - Get testnet credentials from: https://portal.hedera.com/"
    echo ""
    echo "2. 🚀 Deploy the smart contract:"
    echo "   npm run deploy-contract"
    echo ""
    echo "3. 🌐 Start the frontend development server:"
    echo "   npm run dev"
    echo ""
    echo "4. 🔗 Open your browser and visit:"
    echo "   http://localhost:3000"
    echo ""
    echo "📚 Additional Resources:"
    echo "   - README.md: Complete project documentation"
    echo "   - docs/HEDERA_BASICS.md: Hedera blockchain basics"
    echo "   - docs/DEPLOYMENT.md: Deployment guide"
    echo ""
    echo "🆘 Need Help?"
    echo "   - Check the troubleshooting section in README.md"
    echo "   - Join Hedera Discord: https://discord.gg/hedera"
    echo "   - GitHub Issues: https://github.com/your-repo/issues"
    echo ""
    print_success "Happy building on Hedera! 🚀"
}

# Main setup function
main() {
    echo ""
    print_status "Starting setup process..."
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_root_dependencies
    install_contract_dependencies
    install_frontend_dependencies
    
    # Compile and test
    compile_contract
    
    # Only run tests if not in CI environment
    if [ -z "$CI" ]; then
        test_contract
    else
        print_warning "Skipping tests in CI environment"
    fi
    
    # Build frontend
    build_frontend
    
    # Show next steps
    show_next_steps
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' INT

# Run main function
main

echo ""
print_success "Setup script completed successfully!"
