'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Item {
  value: string;
  label: string;
  subLabel: string;
}

interface ComboboxProps {
  items: Item[];
  placeholder: string;
  noItemFoundMessage: string;
  value: string;
  open: boolean;
  onChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function Combobox({ items, placeholder, noItemFoundMessage, value, open, onChange, onOpenChange }: ComboboxProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const ComboboxContent = (
    <Command className="mt-2">
      <CommandEmpty>{noItemFoundMessage}</CommandEmpty>
      <CommandGroup className="max-h-64">
        {items.map((item) => (
          <CommandItem
            key={item.value}
            value={item.value}
            onSelect={(currentValue) => {
              onChange(currentValue);
              onOpenChange(false);

              onChange(items.find((item) => item.value.toLowerCase() === currentValue)?.value || '');
            }}
            className="flex items-center"
          >
            <Check className={cn('mr-2 h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')} />
            {item.label}
            {item.subLabel && <span className="ml-2 text-xs font-light text-neutral-400">{item.subLabel}</span>}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange} modal={true}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full border-white/10">
            {value ? (
              <div className="flex items-baseline">
                <span>{items.find((item) => item.value === value)?.label}</span>
                <span className="ml-2 text-xs font-light text-neutral-400">{items.find((item) => item.value === value)?.subLabel}</span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">{ComboboxContent}</PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full border-white/10">
          {value ? (
            <div className="flex items-baseline">
              <span>{items.find((item) => item.value === value)?.label}</span>
              <span className="ml-2 text-xs font-light text-neutral-400">{items.find((item) => item.value === value)?.subLabel}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>{ComboboxContent}</DrawerContent>
    </Drawer>
  );
}
