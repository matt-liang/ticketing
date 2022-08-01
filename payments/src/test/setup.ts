import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51K9DUDBwlLtfzlWrMcvUe98Auj4Otw8pYiURjRvP1zbMmqjz4pM8ywRANohavkhXTDa38yxnpbufsDyqqGBBywqN00PoGLZ3Bd';

let mongod: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'test';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongod = await MongoMemoryServer.create();
    const mongoUri = await mongod.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongod.stop();
    await mongoose.connection.close();
});