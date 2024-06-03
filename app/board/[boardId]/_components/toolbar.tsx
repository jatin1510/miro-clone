import { Skeleton } from "@/components/ui/skeleton";
import { ToolButton } from "./tool-button";
import {
    Circle,
    MousePointer2,
    Pencil,
    Redo2,
    Square,
    StickyNote,
    TypeIcon,
    Undo2,
} from "lucide-react";
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { useEffect } from "react";
import { useSelf } from "@/liveblocks.config";

interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const Toolbar = ({
    canvasState,
    setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
}: ToolbarProps) => {
    const selection = useSelf((me) => me.presence.selection);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (selection?.length > 0) return;

            switch (e.key) {
                case "a":
                    setCanvasState({ mode: CanvasMode.None });
                    break;

                case "t":
                    setCanvasState({
                        layerType: LayerType.Text,
                        mode: CanvasMode.Inserting,
                    });
                    break;

                case "s":
                    setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Note,
                    });
                    break;

                case "r":
                    setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Rectangle,
                    });
                    break;

                case "e":
                    setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Ellipse,
                    });
                    break;

                case "p":
                    setCanvasState({
                        mode: CanvasMode.Pencil,
                    });
                    break;

                default:
                    break;
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [selection, setCanvasState]);
    
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
            <div className="bg-white rounded-md p-1.5 flex gap-1 flex-col items-center shadow-md">
                <ToolButton
                    label="Select (A)"
                    icon={MousePointer2}
                    onClick={() => setCanvasState({ mode: CanvasMode.None })}
                    isActive={
                        canvasState.mode === CanvasMode.None ||
                        canvasState.mode === CanvasMode.Translating ||
                        canvasState.mode === CanvasMode.SelectionNet ||
                        canvasState.mode === CanvasMode.Pressing ||
                        canvasState.mode === CanvasMode.Resizing
                    }
                />
                <ToolButton
                    label="Text (T)"
                    icon={TypeIcon}
                    onClick={() =>
                        setCanvasState({
                            layerType: LayerType.Text,
                            mode: CanvasMode.Inserting,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Text
                    }
                />
                <ToolButton
                    label="Sticky Notes (S)"
                    icon={StickyNote}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Note,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Note
                    }
                />
                <ToolButton
                    label="Rectangle (R)"
                    icon={Square}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Rectangle,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Rectangle
                    }
                />
                <ToolButton
                    label="Ellipse (E)"
                    icon={Circle}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Ellipse,
                        })
                    }
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Ellipse
                    }
                />
                <ToolButton
                    label="Pen (P)"
                    icon={Pencil}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Pencil,
                        })
                    }
                    isActive={canvasState.mode === CanvasMode.Pencil}
                />
            </div>
            <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
                <ToolButton
                    label="Undo (Ctrl+Z)"
                    icon={Undo2}
                    onClick={undo}
                    isDisabled={!canUndo}
                />
                <ToolButton
                    label="Redo (Ctrl+Shift+Z)"
                    icon={Redo2}
                    onClick={redo}
                    isDisabled={!canRedo}
                />
            </div>
        </div>
    );
};

export const ToolbarSkeleton = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 rounded-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] h-[360px] w-[52px]">
            <Skeleton />
        </div>
    );
};

export default Toolbar;
