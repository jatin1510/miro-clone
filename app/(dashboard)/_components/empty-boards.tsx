"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const EmptyBoards = () => {
    const { organization } = useOrganization();
    const { pending, mutate } = useApiMutation(api.board.create);
    const router = useRouter();

    const onClick = async () => {
        if (!organization) {
            return;
        }
        try {
            await mutate({ orgId: organization.id, title: "Untitled" })
                .then((id) => {
                    toast.success("Board created");
                    router.push(`/board/${id}`);
                })
                .catch((error) => {
                    toast.error("Failed to create board");
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image
                src="/note.svg"
                alt="Empty Boards"
                height={110}
                width={110}
            />
            <h2 className="text-2xl font-semibold mt-6">
                Create your first board!
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Start by creating a board for your organization
            </p>
            <div className="mt-6">
                <Button disabled={pending} onClick={onClick} size="lg">
                    Create Board
                </Button>
            </div>
        </div>
    );
};
