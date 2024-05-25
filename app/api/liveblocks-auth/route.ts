import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";

import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
    const authorization = await auth();
    const user = await currentUser();

    if (!authorization || !user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { room } = await request.json();
    const board = await convex.query(api.board.get, { id: room });

    if (board?.orgId !== authorization.orgId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userInfo = {
        name: user.firstName || "Anonymous",
        picture: user.imageUrl!,
    };

    const session = liveblocks.prepareSession(user.id, {
        userInfo,
    });

    if (room) {
        session.allow(room, session.FULL_ACCESS);
    }

    const { status, body } = await session.authorize();
    return new Response(body, { status });
}
