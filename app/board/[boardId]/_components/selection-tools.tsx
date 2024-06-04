"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFront, Copy, SendToBack, Trash2 } from "lucide-react";
import { BringToFrontIcon, SendToBackIcon } from "@/components/icon";

interface SelectionToolsProps {
    camera: Camera;
    setLastUsedColor: (color: Color) => void;
    onDuplicate: () => void;
    lastUsedColor: Color;
}

export const SelectionTools = memo(
    ({ camera, setLastUsedColor, onDuplicate, lastUsedColor }: SelectionToolsProps) => {
        const selection = useSelf((me) => me.presence.selection);

        const moveToFront = useMutation(
            ({ storage }) => {
                const liveLayerIds = storage.get("layerIds");
                const indices: number[] = [];
                const arr = liveLayerIds.toImmutable();

                for (let i = 0; i < arr.length; i++) {
                    if (selection.includes(arr[i])) {
                        indices.push(i);
                    }
                }

                for (let i = indices.length - 1; i >= 0; i--) {
                    liveLayerIds.move(
                        indices[i],
                        arr.length - 1 - (indices.length - 1 - i)
                    );
                }
            },
            [selection]
        );

        const moveToBack = useMutation(
            ({ storage }) => {
                const liveLayerIds = storage.get("layerIds");
                const indices: number[] = [];
                const arr = liveLayerIds.toImmutable();

                for (let i = 0; i < arr.length; i++) {
                    if (selection.includes(arr[i])) {
                        indices.push(i);
                    }
                }

                for (let i = 0; i < indices.length; i++) {
                    liveLayerIds.move(indices[i], i);
                }
            },
            [selection]
        );

        const setFill = useMutation(
            ({ storage }, fill: Color) => {
                const liveLayers = storage.get("layers");
                setLastUsedColor(fill);
                if (!selection) {
                    return;
                }
                selection.forEach((id) =>
                    liveLayers.get(id)?.set("fill", fill)
                );
            },
            [selection, setLastUsedColor]
        );

        const deleteLayers = useDeleteLayers();

        const selectionBounds = useSelectionBounds();

        if (!selectionBounds) {
            return null;
        }

        const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
        const y = selectionBounds.y + camera.y;

        return (
            <div
                className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
                style={{
                    transform: `translate(
                    calc(${x}px - 50%),
                    calc(${y - 16}px - 100%)
                )`,
                }}
            >
                <ColorPicker onChange={setFill} lastUsedColor={lastUsedColor} />
                <div className="flex flex-col gap-y-0.5">
                    <Hint label="Bring to front">
                        <Button
                            onClick={moveToFront}
                            variant="board"
                            size="icon"
                        >
                            <BringToFrontIcon
                                color="black"
                                height={30}
                                width={30}
                            />
                        </Button>
                    </Hint>
                    <Hint label="Send to back" side="bottom">
                        <Button
                            onClick={moveToBack}
                            variant="board"
                            size="icon"
                        >
                            <SendToBackIcon
                                color="black"
                                height={30}
                                width={30}
                            />
                        </Button>
                    </Hint>
                </div>
                <div className="flex flex-col items-center pl-2 ml-2 border-l border-neutral-200">
                    <Hint label="Duplicate (ctrl + D)">
                        <Button
                            onClick={onDuplicate}
                            variant="board"
                            size="icon"
                        >
                            <Copy />
                        </Button>
                    </Hint>
                    <Hint label="Delete" side="bottom">
                        <Button
                            variant="boardDestructive"
                            size="icon"
                            onClick={deleteLayers}
                        >
                            <Trash2 />
                        </Button>
                    </Hint>
                </div>
            </div>
        );
    }
);

SelectionTools.displayName = "SelectionTools";
