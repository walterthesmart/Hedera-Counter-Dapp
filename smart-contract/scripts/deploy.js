const {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateFlow,
    ContractFunctionParameters,
    Hbar
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Hedera Smart Contract Deployment Script
 * This script deploys the Counter contract to Hedera network
 */

async function main() {
    console.log("🚀 Starting Hedera Counter Contract Deployment...\n");

    // Validate environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.error("❌ Error: Missing required environment variables!");
        console.error("Please set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in your .env file");
        console.error("You can get these from: https://portal.hedera.com/");
        process.exit(1);
    }

    // Setup Hedera client
    const network = process.env.HEDERA_NETWORK || "testnet";
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    let client;
    if (network === "mainnet") {
        client = Client.forMainnet();
        console.log("🌐 Connected to Hedera Mainnet");
    } else {
        client = Client.forTestnet();
        console.log("🌐 Connected to Hedera Testnet");
    }

    client.setOperator(accountId, privateKey);

    try {
        // Read the compiled contract bytecode
        const contractPath = path.join(__dirname, "../artifacts/contracts/Counter.sol/Counter.json");
        
        if (!fs.existsSync(contractPath)) {
            console.error("❌ Contract artifact not found!");
            console.error("Please run 'npm run compile' first to compile the contract.");
            process.exit(1);
        }

        const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
        const contractBytecode = contractJson.bytecode;

        console.log("📄 Contract bytecode loaded successfully");
        console.log(`📊 Bytecode size: ${contractBytecode.length / 2} bytes\n`);

        // Deploy the contract with initial count of 0
        console.log("⏳ Deploying Counter contract...");
        
        const contractCreateTx = new ContractCreateFlow()
            .setGas(300000) // Adjust gas limit as needed
            .setBytecode(contractBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters().addUint256(0) // Initial count = 0
            )
            .setMaxTransactionFee(new Hbar(2)); // Max fee for deployment

        const contractCreateSubmit = await contractCreateTx.execute(client);
        const contractCreateRx = await contractCreateSubmit.getReceipt(client);
        
        const contractId = contractCreateRx.contractId;
        const contractAddress = contractId.toSolidityAddress();

        console.log("✅ Contract deployed successfully!");
        console.log(`📋 Contract ID: ${contractId}`);
        console.log(`📍 Contract Address: 0x${contractAddress}`);
        console.log(`🔗 Network: ${network}`);
        console.log(`💰 Transaction ID: ${contractCreateSubmit.transactionId}\n`);

        // Save deployment information
        const deploymentInfo = {
            contractId: contractId.toString(),
            contractAddress: `0x${contractAddress}`,
            network: network,
            deployedAt: new Date().toISOString(),
            transactionId: contractCreateSubmit.transactionId.toString(),
            deployerAccount: accountId.toString()
        };

        const deploymentPath = path.join(__dirname, "../config/deployment.json");
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to config/deployment.json");

        // Update .env file with contract information
        const envPath = path.join(__dirname, "../../.env");
        let envContent = "";
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, "utf8");
        }

        // Update or add contract information
        const contractIdLine = `CONTRACT_ID=${contractId.toString()}`;
        const contractAddressLine = `CONTRACT_ADDRESS=0x${contractAddress}`;
        const nextPublicContractIdLine = `NEXT_PUBLIC_CONTRACT_ID=${contractId.toString()}`;

        if (envContent.includes("CONTRACT_ID=")) {
            envContent = envContent.replace(/CONTRACT_ID=.*/, contractIdLine);
        } else {
            envContent += `\n${contractIdLine}`;
        }

        if (envContent.includes("CONTRACT_ADDRESS=")) {
            envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, contractAddressLine);
        } else {
            envContent += `\n${contractAddressLine}`;
        }

        if (envContent.includes("NEXT_PUBLIC_CONTRACT_ID=")) {
            envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ID=.*/, nextPublicContractIdLine);
        } else {
            envContent += `\n${nextPublicContractIdLine}`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log("📝 Environment variables updated");

        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n📋 Next Steps:");
        console.log("1. Copy the CONTRACT_ID to your frontend environment variables");
        console.log("2. Test the contract using the frontend application");
        console.log("3. Verify the contract on HashScan:");
        
        if (network === "testnet") {
            console.log(`   https://hashscan.io/testnet/contract/${contractId}`);
        } else {
            console.log(`   https://hashscan.io/mainnet/contract/${contractId}`);
        }

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("INSUFFICIENT_ACCOUNT_BALANCE")) {
            console.error("\n💡 Tip: Make sure your account has sufficient HBAR balance");
            console.error("You can get testnet HBAR from: https://portal.hedera.com/");
        }
        
        process.exit(1);
    } finally {
        client.close();
    }
}

// Handle script execution
if (require.main === module) {
    main().catch((error) => {
        console.error("❌ Unexpected error:", error);
        process.exit(1);
    });
}

module.exports = { main };
