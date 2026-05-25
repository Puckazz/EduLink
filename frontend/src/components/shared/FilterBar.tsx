import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
  options: FilterOption[];
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}

interface FilterBarProps {
  fields: FilterField[];
  onFilterChange?: (id: string, value: string) => void;
}

export function FilterBar({ fields, onFilterChange }: FilterBarProps) {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardContent className="px-4 pt-4 pb-4 sm:px-6 sm:pt-5">
        <div className="flex flex-wrap gap-3">
          {fields.map((field) => (
            <div key={field.id} className="flex min-w-[160px] flex-1 flex-col gap-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.icon && (
                  <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{field.icon}</span>
                )}
                {field.label}
              </p>
              <Select
                value={field.value}
                defaultValue={field.defaultValue}
                disabled={field.disabled}
                onValueChange={(value) => onFilterChange?.(field.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
