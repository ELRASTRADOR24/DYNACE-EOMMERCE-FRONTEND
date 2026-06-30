import mongoose from 'mongoose';

async function test() {
  try {
    await mongoose.connect('mongodb+srv://admin:4aOH4utY2gJM6q4H@cluster0.tmgtwyi.mongodb.net/mvp');
    console.log("Connecté !");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections dans 'mvp':", collections.map(c => c.name));
    
    const db = mongoose.connection.client.db('admin');
    const dbs = await db.admin().listDatabases();
    console.log("Bases de données disponibles:", dbs.databases.map(d => d.name));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
