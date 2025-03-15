
import React from "react";
import { Check, ChevronsUpDown, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// List of available folder icons from lucide-react
const folderIcons = [
  { value: "folder", label: "Folder", icon: "folder" },
  { value: "folder-archive", label: "Archive", icon: "folder-archive" },
  { value: "folder-clock", label: "Recent", icon: "folder-clock" },
  { value: "folder-code", label: "Code", icon: "folder-code" },
  { value: "folder-cog", label: "Settings", icon: "folder-cog" },
  { value: "folder-heart", label: "Favorites", icon: "folder-heart" },
  { value: "folder-input", label: "Input", icon: "folder-input" },
  { value: "folder-key", label: "Secure", icon: "folder-key" },
  { value: "folder-lock", label: "Private", icon: "folder-lock" },
  { value: "folder-open", label: "Open", icon: "folder-open" },
  { value: "folder-output", label: "Output", icon: "folder-output" },
  { value: "folder-search", label: "Search", icon: "folder-search" },
  { value: "folder-star", label: "Starred", icon: "folder-star" },
  { value: "folder-symlink", label: "Linked", icon: "folder-symlink" },
  { value: "folder-x", label: "Hidden", icon: "folder-x" },
];

interface FolderIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function FolderIconPicker({ value, onChange }: FolderIconPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedIcon = folderIcons.find(icon => icon.value === value) || folderIcons[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          <FolderIcon className="mr-2 h-4 w-4" />
          {selectedIcon.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandEmpty>No icon found.</CommandEmpty>
          <CommandGroup>
            {folderIcons.map((icon) => (
              <CommandItem
                key={icon.value}
                value={icon.value}
                onSelect={() => {
                  onChange(icon.value);
                  setOpen(false);
                }}
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                {icon.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === icon.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
