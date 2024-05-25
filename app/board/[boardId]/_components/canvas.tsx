"use client";

import Info from "./info";
import Participants from "./participants";
import Toolbar from "./toolbar";
import { useState } from "react";
import { CanvasState, CanvasMode } from "@/types/canvas";
import { useHistory, useCanUndo, useCanRedo } from "@/liveblocks.config";

interface CanvasProps {
    boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canUndo={canUndo}
                canRedo={canRedo}
                undo={history.undo}
                redo={history.redo}
            />
        </main>
    );
};
