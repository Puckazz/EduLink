'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const isDropdownLayout =
    props.captionLayout === 'dropdown' ||
    props.captionLayout === 'dropdown-months' ||
    props.captionLayout === 'dropdown-years';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: cn('text-sm font-medium', isDropdownLayout && 'hidden'),
        nav: cn('flex items-center gap-1', isDropdownLayout && 'hidden'),
        dropdowns: 'flex items-center gap-2',
        dropdown_root: 'relative rounded-md border border-input shadow-xs',
        dropdown:
          'h-8 appearance-none bg-transparent py-1 pr-8 pl-2 text-sm outline-none',
        months_dropdown: 'text-sm',
        years_dropdown: 'text-sm',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_button: 'size-8',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon
              className={cn('size-4', className)}
              {...iconProps}
            />
          ) : (
            <ChevronRightIcon
              className={cn('size-4', className)}
              {...iconProps}
            />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
