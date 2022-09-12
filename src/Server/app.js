const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://0.0.0.0:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "wordleProject";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("liveGames");

  // the following code inject into the collection liveGames

  const insertResult = await collection.insertMany([
    { player_one: 1 },
    { player_two: 2 },
  ]);
  console.log("Players created =>", insertResult);

  // done
  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
