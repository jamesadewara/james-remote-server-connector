import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Server from '@/models/Server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are promise in Next.js 15+? Or strictly typed. Next 15 yes.
) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
        }

        const deletedServer = await Server.findByIdAndDelete(id);

        if (!deletedServer) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Server deleted successfully' }, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Prevent updating ID
        delete body._id;

        // Mutual Exclusivity: Clear the other credential if one is being set
        const unsetData: Record<string, number> = {};

        if (body.password) {
            // Setting a new password -> Clear privateKey
            // (Assuming server schema allows privateKey to be optional/missing)
            unsetData.privateKey = 1;
        }

        if (body.privateKey) {
            // Setting a new key -> Clear password
            unsetData.password = 1;
        }

        // Clean up body (remove empty fields so we don't save empty strings)
        if (!body.privateKey) delete body.privateKey;
        if (!body.password) delete body.password;

        const updateQuery: Record<string, unknown> = { $set: body };
        if (Object.keys(unsetData).length > 0) {
            updateQuery.$unset = unsetData;
        }

        const updatedServer = await Server.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true, runValidators: true }
        ).select('-privateKey -password');

        if (!updatedServer) {
            return NextResponse.json({ error: 'Server not found' }, { status: 404 });
        }

        return NextResponse.json(updatedServer, { status: 200 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
