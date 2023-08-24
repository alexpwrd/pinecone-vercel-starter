const { PineconeClient } = require("@pinecone-database/pinecone");

async function testPinecone() {
    const pinecone = new PineconeClient();      
    await pinecone.init({      
        environment: "us-west4-gcp",      
        apiKey: "a104c27b-13ae-42f4-bb52-245571379ae3",      
    });      
    const index = pinecone.Index("pwrdai-pvs");
    console.log("Connected to Pinecone index 'pwrdai-pvs'");
}

testPinecone();
