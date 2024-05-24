"use client";

import { ChangeEvent, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";

interface ConfirmModalProps {
    children: React.ReactNode;
    onConfirm: () => void;
    disabled?: boolean;
    header: string;
    description?: string | React.ReactNode;
    title: string;
}

export const ConfirmModal = ({
    children,
    onConfirm,
    disabled,
    header,
    description,
    title,
}: ConfirmModalProps) => {
    const [boardName, setBoardName] = useState("");
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBoardName(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && boardName === title) {
            onConfirm();
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{header}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {/* TODO: Automatically focus the input tag */}
                <Input
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={disabled || boardName !== title}
                        onClick={onConfirm}
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
