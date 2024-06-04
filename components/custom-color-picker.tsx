"use client";

import { forwardRef, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn, colorToCss } from "@/lib/utils";
import { useForwardedRef } from "@/hooks/use-forwarded-ref";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useDebouncyEffect } from "use-debouncy";
import { Color } from "@/types/canvas";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    lastUsedColor: Color;
}

const CustomColorPicker = forwardRef<
    HTMLInputElement,
    Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(
    (
        { disabled, value, lastUsedColor, onChange, onBlur, name, className, ...props },
        forwardedRef
    ) => {
        const ref = useForwardedRef(forwardedRef);
        const [open, setOpen] = useState(false);

        const parsedValue = useMemo(() => {
            return value || colorToCss(lastUsedColor);
        }, [value]);

        return (
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
                    <Button
                        {...props}
                        className={cn("block", className)}
                        name={name}
                        onClick={() => {
                            setOpen(true);
                        }}
                        size="icon"
                        variant="outline"
                    >
                        <Image
                            className="rounded-full"
                            src="/color-picker.png"
                            alt="Empty"
                            height={40}
                            width={40}
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" sideOffset={-1000} className="w-full mb-16">
                    <DebouncedPicker color={parsedValue} onChange={onChange} />
                    <Input
                        className="mt-2"
                        maxLength={7}
                        onChange={(e) => {
                            onChange(e?.currentTarget?.value);
                        }}
                        ref={ref}
                        value={parsedValue}
                    />
                </PopoverContent>
            </Popover>
        );
    }
);

const DebouncedPicker = ({ color, onChange }: any) => {
    const [value, setValue] = useState(color);
  
    useDebouncyEffect(() => onChange(value), 200, [value]);
  
    return <HexColorPicker color={value} onChange={setValue} />;
  };
  

CustomColorPicker.displayName = "ColorPicker";

export { CustomColorPicker };
