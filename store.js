const serviceAccount = require("./serviceAccountKey.json");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");

const dotenv = require("dotenv");
dotenv.config();



class Store {
  firestoreClient = null;
  mongoClient = null;

  constructor(dbType) {
    this.dbType = dbType;
  }

  getFirestoreClient() {
    if (!this.firestoreClient) {
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      const db = getFirestore(app);
      this.firestoreClient = db;
    }
    return this.firestoreClient;
  }

  async getMongoClient() {
    if (!this.mongoClient) {
      const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`;
      const client = new MongoClient(url);
      await client.connect();
      this.mongoClient = client.db(process.env.MONGO_DB);
    }
    return this.mongoClient
  }

  async storeCollection(collectionName, data, recordKey) {
    if (this.dbType === "firestore") {
      const db = this.getFirestoreClient();

      const docs = 0;
      const collectionRef = db.collection(collectionName);
      data.forEach((item) => {
        collectionRef.doc(`${item[recordKey]}`).set(item);
        docs++;
      });

      console.log(`Inserted ${docs} of ${collectionName}`);
    } else if (this.dbType === "mongodb") {
      const prefix = "tankup"
      const db = await this.getMongoClient()
      const collection = db.collection(`${prefix}_${collectionName}`);
      await collection.insertMany(data)
      console.log(`Inserted ${data.length} of ${collectionName}`);

    } else {
      throw "Unknown dbType!";
    }
  }
}

module.exports = Store