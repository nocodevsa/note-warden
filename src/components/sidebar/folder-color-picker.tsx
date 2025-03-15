
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Define color options with their labels and values
const colorOptions = [
  { label: "Red", value: "red", class: "bg-folder-red" },
  { label: "Orange", value: "orange", class: "bg-folder-orange" },
  { label: "Yellow", value: "yellow", class: "bg-folder-yellow" },
  { label: "Green", value: "green", class: "bg-folder-green" },
  { label: "Teal", value: "teal", class: "bg-folder-teal" },
  { label: "Blue", value: "blue", class: "bg-folder-blue" },
  { label: "Indigo", value: "indigo", class: "bg-folder-indigo" },
  { label: "Purple", value: "purple", class: "bg-folder-purple" },
  { label: "Pink", value: "pink", class: "bg-folder-pink" },
];

interface FolderColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function FolderColorPicker({ value, onChange }: FolderColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full flex justify-between items-center"
        >
          <span>Folder Color</span>
          <div 
            className={cn(
              "h-4 w-4 rounded-full", 
              value ? `bg-folder-${value}` : "bg-muted"
            )} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={cn(
                "h-8 rounded-md flex items-center justify-center",
                color.class,
                "hover:opacity-90 transition-opacity"
              )}
              onClick={() => {
                onChange(color.value);
                setOpen(false);
              }}
            >
              {value === color.value && (
                <Check className="h-4 w-4 text-white" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
