"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    alignOffset?: DropdownMenuContentProps["alignOffset"];
    id: string;
    title: string;
}

export const Actions = ({
    children,
    side,
    sideOffset,
    id,
    title,
    alignOffset,
}: ActionProps) => {
    const { onOpen } = useRenameModal();

    const { mutate, pending } = useApiMutation(api.board.remove);

    const onDelete = () => {
        mutate({ id })
            .then(() => toast.success("Board deleted!"))
            .catch(() => toast.error("Failed to delete board"));
    };

    const onCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/board/${id}`)
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
                alignOffset={alignOffset}
            >
                <DropdownMenuItem
                    className="p-2 cursor-pointer"
                    onClick={onCopyLink}
                >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy board link
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="p-2 cursor-pointer"
                    onClick={() => onOpen(id, title)}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmModal
                    header={`Delete board?`}
                    description={
                        <div>
                            To confirm, type{" "}
                            <span className="font-semibold">{title}</span> in
                            the box below
                        </div>
                    }
                    disabled={pending}
                    onConfirm={onDelete}
                    title={title}
                >
                    <Button
                        variant="ghost"
                        className="p-2 cursor-pointer text-rose-600 text-sm w-full justify-start font-normal"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
