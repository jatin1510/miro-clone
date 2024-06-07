"use client";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { useQuery } from "convex/react";
import { ImageDown, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

interface InfoProps {
    boardId: string;
    exportAsPng?: () => void;
}

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

const TabSeparator = () => {
    return <div className="text-neutral-300 px-1.5 pointer-events-none">|</div>;
};

const Info = ({ boardId, exportAsPng }: InfoProps) => {
    const { onOpen } = useRenameModal();
    const data = useQuery(api.board.get, { id: boardId as Id<"boards"> });

    if (!data) return <InfoSkeleton />;

    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            <Hint label="Go to boards" side="bottom" sideOffset={10}>
                <Button asChild className="px-2" variant="board">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="Board Logo"
                            height={40}
                            width={40}
                        />
                        <span
                            className={cn(
                                "font-semibold text-xl ml-2 text-black",
                                font.className
                            )}
                        >
                            Board
                        </span>
                    </Link>
                </Button>
            </Hint>
            <TabSeparator />
            <Hint label="Edit title" side="bottom" sideOffset={10}>
                <Button
                    variant="board"
                    className="text-base font-normal px-2 italic"
                    onClick={() => onOpen(data._id, data.title)}
                >
                    {data.title}
                </Button>
            </Hint>
            <TabSeparator />
            <Hint label="Export as PNG" side="bottom" sideOffset={10}>
                <Button size="icon" variant="board" onClick={exportAsPng}>
                    <ImageDown />
                </Button>
            </Hint>
            <TabSeparator />
            <Actions
                id={data._id}
                title={data.title}
                side="bottom"
                sideOffset={10}
                alignOffset={-7}
            >
                <div>
                    <Hint label="Main Menu" side="bottom" sideOffset={10}>
                        <Button size="icon" variant="board">
                            <Menu />
                        </Button>
                    </Hint>
                </div>
            </Actions>
        </div>
    );
};

export const InfoSkeleton = () => {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] w-[280px]">
            <Skeleton />
        </div>
    );
};

export default Info;
