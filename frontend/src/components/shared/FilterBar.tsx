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
}

interface FilterBarProps {
  fields: FilterField[];
  onFilterChange?: (id: string, value: string) => void;
}

export function FilterBar({ fields, onFilterChange }: FilterBarProps) {
  const gridColsClass =
    fields.length === 1 ? 'grid-cols-1' :
    fields.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
    fields.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
    'grid-cols-1 md:grid-cols-4';

  return (
    <Card className="border-border bg-card">
      <CardContent className={`p-6 grid gap-6 ${gridColsClass}`}>
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {field.label}
            </span>
            <Select
              defaultValue={field.defaultValue}
              onValueChange={(value) => onFilterChange?.(field.id, value)}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 h-11">
                <div className="flex items-center gap-2">
                  {field.icon && (
                    <div className="text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
                      {field.icon}
                    </div>
                  )}
                  <SelectValue placeholder={field.placeholder} />
                </div>
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
      </CardContent>
    </Card>
  );
}
