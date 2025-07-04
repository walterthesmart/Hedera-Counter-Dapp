const {
    Client,
    AccountId,
    PrivateKey,
    ContractCallQuery,
    ContractFunctionParameters
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Contract Verification Script
 * This script verifies that the deployed contract is working correctly
 */

async function main() {
    console.log("🔍 Starting Contract Verification...\n");

    // Load deployment information
    const deploymentPath = path.join(__dirname, "../config/deployment.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Deployment info not found!");
        console.error("Please deploy the contract first using 'npm run deploy'");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractId = deploymentInfo.contractId;

    console.log(`📋 Verifying contract: ${contractId}`);
    console.log(`🌐 Network: ${deploymentInfo.network}\n`);

    // Setup Hedera client
    const network = deploymentInfo.network;
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    let client;
    if (network === "mainnet") {
        client = Client.forMainnet();
    } else {
        client = Client.forTestnet();
    }

    client.setOperator(accountId, privateKey);

    try {
        // Test 1: Get initial count
        console.log("🧪 Test 1: Getting initial count...");
        const getCountQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("getCount");

        const getCountResult = await getCountQuery.execute(client);
        const initialCount = getCountResult.getUint256(0);
        console.log(`✅ Initial count: ${initialCount.toString()}`);

        // Test 2: Get contract info
        console.log("\n🧪 Test 2: Getting contract info...");
        const getInfoQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("getContractInfo");

        const getInfoResult = await getInfoQuery.execute(client);
        const count = getInfoResult.getUint256(0);
        const owner = getInfoResult.getAddress(1);
        const paused = getInfoResult.getBool(2);
        const maxCount = getInfoResult.getUint256(3);
        const minCount = getInfoResult.getUint256(4);

        console.log(`✅ Contract Info:`);
        console.log(`   Count: ${count.toString()}`);
        console.log(`   Owner: 0x${owner}`);
        console.log(`   Paused: ${paused}`);
        console.log(`   Max Count: ${maxCount.toString()}`);
        console.log(`   Min Count: ${minCount.toString()}`);

        // Test 3: Check if contract is paused
        console.log("\n🧪 Test 3: Checking pause status...");
        const isPausedQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("isPaused");

        const isPausedResult = await isPausedQuery.execute(client);
        const pausedStatus = isPausedResult.getBool(0);
        console.log(`✅ Contract paused: ${pausedStatus}`);

        // Test 4: Get owner
        console.log("\n🧪 Test 4: Getting contract owner...");
        const getOwnerQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("getOwner");

        const getOwnerResult = await getOwnerQuery.execute(client);
        const ownerAddress = getOwnerResult.getAddress(0);
        console.log(`✅ Contract owner: 0x${ownerAddress}`);

        console.log("\n🎉 Contract verification completed successfully!");
        console.log("\n📋 Contract Functions Available:");
        console.log("   • increment() - Increment counter by 1");
        console.log("   • decrement() - Decrement counter by 1");
        console.log("   • incrementBy(uint256) - Increment by specified amount");
        console.log("   • decrementBy(uint256) - Decrement by specified amount");
        console.log("   • getCount() - Get current count (view)");
        console.log("   • reset() - Reset counter to 0 (owner only)");
        console.log("   • pause() - Pause contract (owner only)");
        console.log("   • unpause() - Unpause contract (owner only)");
        console.log("   • getContractInfo() - Get all contract info (view)");

        console.log("\n🔗 View on HashScan:");
        if (network === "testnet") {
            console.log(`   https://hashscan.io/testnet/contract/${contractId}`);
        } else {
            console.log(`   https://hashscan.io/mainnet/contract/${contractId}`);
        }

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
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
