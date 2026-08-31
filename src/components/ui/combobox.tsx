// src/components/ui/combobox.tsx
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Flame } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: readonly string[] | ComboboxOption[];
  featuredOptions?: readonly string[] | ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  featuredOptions = [],
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search...',
  emptyText = 'No match found.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const formatList = (list: readonly string[] | ComboboxOption[]) => {
    return list.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  };

  const formattedOptions = React.useMemo(() => formatList(options), [options]);
  const formattedFeatured = React.useMemo(
    () => formatList(featuredOptions),
    [featuredOptions]
  );

  const allItems = [...formattedFeatured, ...formattedOptions];
  const selectedLabel =
    allItems.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-zinc-50 border-zinc-200 text-xs text-zinc-900 font-normal hover:bg-zinc-100 h-9',
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[220px] p-0 bg-white border-zinc-200 shadow-md"
        align="start"
      >
        <Command className="bg-white">
          <CommandInput placeholder={searchPlaceholder} className="text-xs h-9" />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty className="py-2 text-center text-xs text-zinc-500">
              {emptyText}
            </CommandEmpty>

            {/* Featured / Popular Group */}
            {formattedFeatured.length > 0 && (
              <>
                <CommandGroup heading="★ Popular / Top Picks">
                  {formattedFeatured.map((option) => (
                    <CommandItem
                      key={`feat-${option.value}`}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                    >
                      <span className="font-semibold text-zinc-900 truncate">
                        {option.label}
                      </span>
                      <Check
                        className={cn(
                          'mr-2 h-3.5 w-3.5',
                          value === option.value
                            ? 'opacity-100 text-zinc-900 font-bold'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="my-1 border-zinc-100" />
              </>
            )}

            {/* All Options (A–Z) */}
            <CommandGroup heading={formattedFeatured.length > 0 ? "All Options (A–Z)" : undefined}>
              {formattedOptions.map((option) => (
                <CommandItem
                  key={`all-${option.value}`}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="text-xs flex items-center justify-between cursor-pointer py-1.5"
                >
                  <span className="truncate text-zinc-800">{option.label}</span>
                  <Check
                    className={cn(
                      'mr-2 h-3.5 w-3.5',
                      value === option.value
                        ? 'opacity-100 text-zinc-900 font-bold'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}