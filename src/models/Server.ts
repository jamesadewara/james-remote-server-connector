import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServer extends Document {
    name: string;
    hostname: string;     // The address used to connect (domain or IP input)
    ipAddress?: string;   // The resolved IP from health check
    username: string;
    port: number;
    privateKey?: string;
    password?: string;
    description?: string;
    tags: string[];
    status: 'online' | 'offline' | 'unknown';
    createdAt: Date;
    updatedAt: Date;
}

const ServerSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        hostname: { type: String, required: true },
        ipAddress: { type: String },
        username: { type: String, required: true, default: 'root' },
        port: { type: Number, required: true, default: 22 },
        privateKey: { type: String }, // Made optional
        password: { type: String },   // Added password
        description: { type: String },
        tags: { type: [String], default: [] },
        status: { type: String, enum: ['online', 'offline', 'unknown'], default: 'unknown' },
    },
    { timestamps: true }
);

// Prevent overwriting model during hot reload
const Server: Model<IServer> = mongoose.models.Server || mongoose.model<IServer>('Server', ServerSchema);

export default Server;
