"use client";

import Info from "./info";
import Participants from "./participants";
import Toolbar from "./toolbar";
import React, {
    useCallback,
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import { nanoid } from "nanoid";
import {
    CanvasState,
    CanvasMode,
    Camera,
    Color,
    LayerType,
    Point,
    Side,
    XYWH,
    Layer,
} from "@/types/canvas";
import {
    useHistory,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStorage,
    useOthersMapped,
    useSelf,
} from "@/liveblocks.config";
import { CursorsPresence } from "./cursors-presence";
import {
    colorToCss,
    connectionIdToColor,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { ResetCamera } from "./reset-camera";

import { toPng } from "html-to-image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const MAX_LAYERS = 100;
const SELECTION_NET_THRESHOLD = 5;
const MOVE_OFFSET = 5;

interface CanvasProps {
    boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
    const layerIds = useStorage((root) => root.layerIds);

    const pencilDraft = useSelf((me) => me.presence.pencilDraft);

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

    const resetCamera = useCallback(() => {
        setCamera({ x: 0, y: 0 });
    }, []);

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 255,
        g: 255,
        b: 255,
    });

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const insertLayer = useMutation(
        (
            { storage, setMyPresence },
            layerType:
                | LayerType.Ellipse
                | LayerType.Rectangle
                | LayerType.Text
                | LayerType.Note,
            position: Point
        ) => {
            const liveLayers = storage.get("layers");
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            const liveLayerIds = storage.get("layerIds");
            const layerId = nanoid();
            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });

            liveLayerIds.push(layerId);
            liveLayers.set(layerId, layer);

            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor]
    );

    const translateSelectedLayers = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating) {
                return;
            }

            const offset = {
                x: point.x - canvasState.current.x,
                y: point.y - canvasState.current.y,
            };

            const liveLayers = storage.get("layers");
            for (const id of self.presence.selection) {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState]
    );

    const unSelectLayers = useMutation(({ setMyPresence, self }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);

    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            const layers = storage.get("layers").toImmutable();
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });

            const ids = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current
            );

            setMyPresence({ selection: ids });
        },
        [layerIds]
    );

    const startMultiSelection = useCallback((current: Point, origin: Point) => {
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
            SELECTION_NET_THRESHOLD
        ) {
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });
        }
    }, []);

    const continueDrawing = useMutation(
        ({ setMyPresence, self }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            if (
                canvasState.mode !== CanvasMode.Pencil ||
                e.buttons != 1 ||
                pencilDraft == null
            ) {
                return;
            }

            setMyPresence({
                cursor: point,
                pencilDraft:
                    pencilDraft.length === 1 &&
                    pencilDraft[0][0] === point.x &&
                    pencilDraft[0][1] === point.y
                        ? pencilDraft
                        : [...pencilDraft, [point.x, point.y, e.pressure]],
            });
        },
        [canvasState.mode]
    );

    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get("layers");
            const { pencilDraft } = self.presence;

            if (
                pencilDraft == null ||
                pencilDraft.length < 2 ||
                liveLayers.size >= MAX_LAYERS
            ) {
                setMyPresence({ pencilDraft: null });
                return;
            }

            const id = nanoid();
            liveLayers.set(
                id,
                new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
            );

            const liveLayerIds = storage.get("layerIds");
            liveLayerIds.push(id);

            setMyPresence({ pencilDraft: null });
            setCanvasState({
                mode: CanvasMode.Pencil,
            });
        },
        [lastUsedColor]
    );

    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                penColor: lastUsedColor,
            });
        },
        [lastUsedColor]
    );

    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) {
                return;
            }

            const bounds = resizeBounds(
                canvasState.initialBounds,
                canvasState.corner,
                point
            );

            const liveLayers = storage.get("layers");
            const layer = liveLayers.get(self.presence.selection[0]);

            if (layer) {
                layer.update(bounds);
            }
        },
        [canvasState]
    );

    const onResizeHandlePointerDown = useCallback(
        (corner: Side, initialBounds: XYWH) => {
            history.pause();
            setCanvasState({
                mode: CanvasMode.Resizing,
                initialBounds,
                corner,
            });
        },
        [history]
    );

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => {
            return {
                x: camera.x - e.deltaX,
                y: camera.y - e.deltaY,
            };
        });
    }, []);

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            e.preventDefault();
            const current = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === CanvasMode.Pressing) {
                startMultiSelection(current, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
                updateSelectionNet(current, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.Translating) {
                translateSelectedLayers(current);
            } else if (canvasState.mode === CanvasMode.Resizing) {
                resizeSelectedLayer(current);
            } else if (canvasState.mode === CanvasMode.Pencil) {
                continueDrawing(current, e);
            }
            setMyPresence({ cursor: current });
        },
        [
            continueDrawing,
            canvasState,
            resizeSelectedLayer,
            camera,
            translateSelectedLayers,
            startMultiSelection,
            updateSelectionNet,
        ]
    );

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (canvasState.mode === CanvasMode.Inserting) {
                return;
            }

            const point = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure);
                return;
            }

            setCanvasState({ mode: CanvasMode.Pressing, origin: point });
        },
        [camera, canvasState.mode, setCanvasState, startDrawing]
    );

    const onPointerUp = useMutation(
        ({}, e) => {
            const point = pointerEventToCanvasPoint(e, camera);

            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                unSelectLayers();
                setCanvasState({ mode: CanvasMode.None });
            } else if (canvasState.mode === CanvasMode.Pencil) {
                insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
            } else {
                setCanvasState({ mode: CanvasMode.None });
            }
            history.resume();
        },
        [
            setCanvasState,
            camera,
            canvasState,
            history,
            insertLayer,
            unSelectLayers,
            insertPath,
        ]
    );

    const selections = useOthersMapped((other) => other.presence.selection);

    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            if (
                canvasState.mode === CanvasMode.Pencil ||
                canvasState.mode === CanvasMode.Inserting
            ) {
                return;
            }

            history.pause();
            e.stopPropagation();

            const point = pointerEventToCanvasPoint(e, camera);

            if (!self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }

            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [setCanvasState, history, camera, canvasState.mode]
    );

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};
        for (const user of selections) {
            const [connectionId, selection] = user;
            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] =
                    connectionIdToColor(connectionId);
            }
        }
        return layerIdsToColorSelection;
    }, [selections]);

    const duplicateLayers = useMutation(({ storage, self, setMyPresence }) => {
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");
        const newLayerIds: string[] = [];
        const layersIdsToCopy = self.presence.selection;

        if (liveLayerIds.length + layersIdsToCopy.length > MAX_LAYERS) {
            return;
        }

        if (layersIdsToCopy.length === 0) {
            return;
        }

        layersIdsToCopy.forEach((layerId) => {
            const newLayerId = nanoid();
            const layer = liveLayers.get(layerId);

            if (layer) {
                const newLayer = layer.clone();
                newLayer.set("x", newLayer.get("x") + 10);
                newLayer.set("y", newLayer.get("y") + 10);

                liveLayerIds.push(newLayerId);
                liveLayers.set(newLayerId, newLayer);

                newLayerIds.push(newLayerId);
            }
        });

        setMyPresence({ selection: [...newLayerIds] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
    }, []);

    const moveSelectedLayers = useMutation(
        ({ storage, self, setMyPresence }, offset: Point) => {
            const liveLayers = storage.get("layers");
            const selection = self.presence.selection;

            if (selection.length === 0) {
                return;
            }

            for (const id of selection) {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }

            setMyPresence({ selection }, { addToHistory: true });
        },
        [canvasState, history]
    );

    const svgRef = useRef<SVGSVGElement | null>(null);
    const data = useQuery(api.board.get, { id: boardId as Id<"boards"> });

    const exportAsPng = () => {
        if (svgRef.current) {
            const bbox = svgRef.current.getBBox();
            const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

            svgClone.setAttribute("width", bbox.width.toString());
            svgClone.setAttribute("height", bbox.height.toString());
            svgClone.setAttribute(
                "viewBox",
                `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
            );

            document.body.appendChild(svgClone);

            toPng(svgClone as unknown as HTMLElement)
                .then((dataUrl) => {
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = `${data?.title || "download"}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    document.body.removeChild(svgClone);
                })
                .catch((error) => {
                    console.error("Error exporting SVG to PNG", error);
                    document.body.removeChild(svgClone);
                });
        }
    };

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            let offset: Point = { x: 0, y: 0 };
            switch (e.key) {
                case "d": {
                    if (e.ctrlKey && canvasState.mode === CanvasMode.None) {
                        duplicateLayers();
                    }
                    break;
                }
                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
                }
                case "ArrowUp":
                    offset = { x: 0, y: -MOVE_OFFSET };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowDown":
                    offset = { x: 0, y: MOVE_OFFSET };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowLeft":
                    offset = { x: -MOVE_OFFSET, y: 0 };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowRight":
                    offset = { x: MOVE_OFFSET, y: 0 };
                    moveSelectedLayers(offset);
                    break;
                default:
                    break;
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [history]);

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} exportAsPng={exportAsPng} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canUndo={canUndo}
                canRedo={canRedo}
                undo={history.undo}
                redo={history.redo}
            />
            {camera.x != 0 && camera.y != 0 && (
                <ResetCamera resetCamera={resetCamera} />
            )}
            <SelectionTools
                onDuplicate={duplicateLayers}
                camera={camera}
                setLastUsedColor={setLastUsedColor}
                lastUsedColor={lastUsedColor}
            />
            <svg
                ref={svgRef}
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px)`,
                    }}
                >
                    {layerIds.map((layerId) => {
                        return (
                            <LayerPreview
                                key={layerId}
                                id={layerId}
                                onLayerPointerDown={onLayerPointerDown}
                                selectionColor={
                                    layerIdsToColorSelection[layerId]
                                }
                            />
                        );
                    })}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet &&
                        canvasState.current && (
                            <rect
                                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                                x={Math.min(
                                    canvasState.origin.x,
                                    canvasState.current.x
                                )}
                                y={Math.min(
                                    canvasState.origin.y,
                                    canvasState.current.y
                                )}
                                width={Math.abs(
                                    canvasState.origin.x - canvasState.current.x
                                )}
                                height={Math.abs(
                                    canvasState.origin.y - canvasState.current.y
                                )}
                            />
                        )}
                    <CursorsPresence />
                    {pencilDraft && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};
