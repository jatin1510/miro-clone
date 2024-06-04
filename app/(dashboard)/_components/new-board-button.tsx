"use client";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
}

const MAX_BOARDS_WITHIN_ORG = 5;

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.board.create);

    const data = useQuery(api.board.getTotalBoardCountOfOrg, {
        orgId,
    });

    const onClick = () => {
        if (data && data >= MAX_BOARDS_WITHIN_ORG) {
            toast.error(
                `You can only have ${MAX_BOARDS_WITHIN_ORG} boards within an organization`
            );
            return;
        }

        mutate({ orgId, title: "Untitled" })
            .then((id) => {
                toast.success("Board created!");
                router.push(`/board/${id}`);
            })
            .catch(() => toast.error("Failed to create board"));
    };

    return (
        <button
            disabled={pending || disabled}
            onClick={onClick}
            className={cn(
                "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
                (pending || disabled) && "opacity-75 hover:bg-blue-600 cursor-not-allowed"
            )}
        >
            <div />
            <Plus className="h-12 w-12 text-white stroke-1" />
            <p className="text-sm text-white font-light">New board</p>
        </button>
    );
};
