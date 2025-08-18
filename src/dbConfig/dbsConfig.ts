import mongoose from 'mongoose';

export async function connect() {
    if (process.env.NODE_ENV === 'test') {
        // Skip DB connection during tests
        return;
    }
    try {
        mongoose.connect(process.env.MONGO_URI!);
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDb Connected');
        });

        connection.on('error', (err) => {
            console.log('MongoDB connection error. Please make sure MongoDb is running' + err);
            process.exit();
        });
    } catch (error) {
        console.log('Something went wrong!');
        console.log(error);
    }
}