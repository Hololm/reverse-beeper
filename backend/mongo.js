const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://josephholm27:hololm27@discord.kbpob.mongodb.net/?retryWrites=true&w=majority&appName=discord";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db('<database-name>');
    const collection = database.collection('<collection-name>');

    // Perform database operations here
    const result = await collection.findOne({});
    console.log(result);

  } finally {
    await client.close();
  }
}

run().catch(console.error);