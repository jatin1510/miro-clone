import React, { useState } from "react";
import { Locate, LocateFixed } from "lucide-react";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResetCameraProps {
    resetCamera: () => void;
}

export const ResetCamera = ({ resetCamera }: ResetCameraProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Hint label="Reset Camera" side="left">
            <div
                className="absolute bottom-2 right-2 bg-white rounded-md px-1.5 h-12 w-12 flex items-center justify-center shadow-md cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Button variant="board" size="icon" onClick={resetCamera}>
                    {isHovered ? (
                        <LocateFixed size={30} />
                    ) : (
                        <Locate size={30} />
                    )}
                </Button>
            </div>
        </Hint>
    );
};

export const ResetCameraSkeleton = () => {
    return (
        <div className="absolute bottom-2 right-2 bg-white rounded-md px-1.5 h-12 w-12 flex items-center justify-center shadow-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]">
            <Skeleton />
        </div>
    );
};