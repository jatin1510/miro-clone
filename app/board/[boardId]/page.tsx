"use client";

import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";
import { useEffect } from "react";
interface BoardIdPageProps {
    params: { boardId: string };
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
    useEffect(() => {
        document.title = `Board - Miro Clone`;
    }, []);

    return (
        <Room roomId={params.boardId} fallback={<Loading />}>
            <Canvas boardId={params.boardId} />
        </Room>
    );
};

export default BoardIdPage;
