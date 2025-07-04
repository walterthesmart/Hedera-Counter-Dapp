// Simple test deployment script
require("dotenv").config();

console.log("🔍 Testing deployment environment...");
console.log("Account ID:", process.env.HEDERA_ACCOUNT_ID);
console.log("Network:", process.env.HEDERA_NETWORK);
console.log("Private Key length:", process.env.HEDERA_PRIVATE_KEY ? process.env.HEDERA_PRIVATE_KEY.length : "NOT SET");

try {
    const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
    console.log("✅ Hedera SDK imported successfully");
    
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    console.log("✅ Account ID parsed:", accountId.toString());
    
    const privateKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
    console.log("✅ Private Key parsed successfully");
    
    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);
    console.log("✅ Client configured successfully");
    
    console.log("🎉 Environment test passed! Ready for deployment.");
    
} catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
}
