import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

interface CalendarPosition {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  min,
  max,
  disabled = false,
  className
}: DatePickerProps) {
  const selectedDate = value ? parseISO(value.slice(0, 10)) : undefined;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate && isValid(selectedDate) ? selectedDate : new Date()
  );
  const [position, setPosition] = useState<CalendarPosition>();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 8;
    const width = Math.min(320, window.innerWidth - viewportPadding * 2);
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const availableAbove = rect.top - viewportPadding - gap;
    const placeAbove = availableBelow < 360 && availableAbove > availableBelow;
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
    );
    setPosition({
      left,
      width,
      ...(placeAbove ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap })
    });
  }, []);

  useEffect(() => {
    if (open && selectedDate && isValid(selectedDate)) setVisibleMonth(selectedDate);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !calendarRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const days: Date[] = [];
  for (
    let day = startOfWeek(startOfMonth(visibleMonth));
    day <= endOfWeek(endOfMonth(visibleMonth));
    day = addDays(day, 1)
  ) {
    days.push(day);
  }
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;
  const isDisabledDate = (date: Date) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate));

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          "flex h-11 w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 text-left text-sm outline-none transition hover:border-brand-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-brand-500 ring-4 ring-brand-500/10"
        )}
      >
        <CalendarDays size={17} className="shrink-0 text-muted" />
        <span className={clsx("min-w-0 flex-1 truncate", !selectedDate && "text-slate-400")}>
          {selectedDate && isValid(selectedDate) ? format(selectedDate, "MMM d, yyyy") : placeholder}
        </span>
        {selectedDate && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            className="rounded-md p-1 text-muted hover:bg-canvas hover:text-ink"
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onChange("");
              }
            }}
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={calendarRef}
            role="dialog"
            aria-label="Choose date"
            className="fixed z-[120] rounded-2xl border border-line bg-white p-3 shadow-[0_18px_50px_rgba(23,33,31,0.18)] animate-in"
            style={{
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              width: position.width
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <div className="font-display text-sm font-bold">{format(visibleMonth, "MMMM yyyy")}</div>
                <button
                  type="button"
                  className="mt-0.5 text-[10px] font-semibold text-brand-600 hover:text-brand-900"
                  onClick={() => setVisibleMonth(new Date())}
                >
                  Today
                </button>
              </div>
              <button
                type="button"
                aria-label="Next month"
                className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((name) => (
                <span className="py-2 text-center text-[10px] font-bold uppercase text-muted" key={name}>
                  {name}
                </span>
              ))}
              {days.map((day) => {
                const dateValue = format(day, "yyyy-MM-dd");
                const selected = selectedDate && isSameDay(day, selectedDate);
                const today = isSameDay(day, new Date());
                const outsideMonth = !isSameMonth(day, visibleMonth);
                const unavailable = isDisabledDate(day);
                return (
                  <button
                    type="button"
                    disabled={unavailable}
                    key={dateValue}
                    onClick={() => {
                      onChange(dateValue);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={clsx(
                      "mx-auto grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold transition",
                      outsideMonth && "text-slate-300",
                      !outsideMonth && !selected && "text-ink hover:bg-brand-50 hover:text-brand-900",
                      today && !selected && "ring-1 ring-brand-500",
                      selected && "bg-brand-700 text-white shadow-sm",
                      unavailable && "cursor-not-allowed opacity-25"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
