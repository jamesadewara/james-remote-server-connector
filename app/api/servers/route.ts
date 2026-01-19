import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Server from '@/models/Server';

export async function GET() {
    try {
        await dbConnect();
        // Exclude privateKey for security
        const servers = await Server.find({}).select('-privateKey -password').sort({ createdAt: -1 });
        return NextResponse.json(servers);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.hostname || (!body.privateKey && !body.password)) {
            return NextResponse.json({ error: 'Missing required fields (Name, Host, and Key/Password)' }, { status: 400 });
        }

        // Ensure tags is an array if passed
        if (body.tags && !Array.isArray(body.tags)) {
            if (typeof body.tags === 'string') {
                body.tags = body.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
            }
        }

        const server = await Server.create(body);

        // Return the created server without the private key if possible, 
        // though for immediate UI feedback it might be okay. 
        // To be safe, we can deselect it or just return what we got (minus sensitive if we reload).
        // The UI adds it to state. Mongoose return generic object includes it. 
        // Let's strip it manually or re-fetch.
        const serverObject = server.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { privateKey, password, ...serverResponse } = serverObject;

        return NextResponse.json(serverResponse, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
