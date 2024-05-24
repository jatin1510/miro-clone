"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

interface ActionProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
}

export const Actions = ({
    children,
    side,
    sideOffset,
    id,
    title,
}: ActionProps) => {
    const onCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/boards/${id}`)
            .then(() => toast.success("Link copied!"))
            .catch(() => toast.error("Failed to copy link"));
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                align="end"
                className="w-50"
                alignOffset={22}
            >
                <DropdownMenuItem
                    className="p-2 cursor-pointer text-sm"
                    onClick={onCopyLink}
                >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy board link
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
