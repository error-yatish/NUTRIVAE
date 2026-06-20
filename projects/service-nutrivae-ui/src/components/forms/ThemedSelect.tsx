import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

export interface ThemedSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ThemedSelectProps {
  value?: string;
  options: ThemedSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  variant?: "default" | "sidebar";
  disabled?: boolean;
}

interface MenuPosition {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
}

export function ThemedSelect({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  label,
  className,
  variant = "default",
  disabled = false
}: ThemedSelectProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const menuGap = 8;
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap;
    const availableAbove = rect.top - viewportPadding - menuGap;
    const placeAbove = availableBelow < 220 && availableAbove > availableBelow;
    const width = Math.max(rect.width, variant === "sidebar" ? 224 : rect.width);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
    );

    setMenuPosition({
      left,
      width,
      maxHeight: Math.max(120, Math.min(288, placeAbove ? availableAbove : availableBelow)),
      ...(placeAbove ? { bottom: window.innerHeight - rect.top + menuGap } : { top: rect.bottom + menuGap })
    });
  }, [variant]);

  const selectOption = (option: ThemedSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    if (!options.length) return;
    let nextIndex = activeIndex;
    do {
      nextIndex = (nextIndex + direction + options.length) % options.length;
    } while (options[nextIndex]?.disabled && nextIndex !== activeIndex);
    setActiveIndex(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        moveActive(event.key === "ArrowDown" ? 1 : -1);
      }
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) setOpen(true);
      else if (options[activeIndex]) selectOption(options[activeIndex]);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const update = () => updateMenuPosition();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  useEffect(() => {
    menuRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {label && <span className="label">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          "flex w-full items-center justify-between gap-3 rounded-xl border text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
          variant === "sidebar"
            ? "min-h-10 border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:border-white/25 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
            : "h-11 border-line bg-white px-3.5 text-sm hover:border-brand-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
          open && variant === "sidebar" && "border-white/30 bg-white/15",
          open && variant === "default" && "border-brand-500 ring-4 ring-brand-500/10"
        )}
      >
        <span className={clsx("min-w-0 flex-1 truncate", !selected && "opacity-60")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={15}
          className={clsx("shrink-0 opacity-70 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-activedescendant={`${listboxId}-${activeIndex}`}
            className="fixed z-[120] overflow-y-auto overscroll-contain rounded-xl border border-line bg-white p-1.5 text-ink shadow-[0_18px_50px_rgba(23,33,31,0.18)] animate-in"
            style={{
              left: menuPosition.left,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              width: menuPosition.width,
              maxHeight: menuPosition.maxHeight
            }}
          >
            {options.length ? (
              options.map((option, index) => (
                <button
                  id={`${listboxId}-${index}`}
                  data-option-index={index}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  disabled={option.disabled}
                  key={option.value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={clsx(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-40",
                    index === activeIndex && "bg-brand-50",
                    option.value === value && "text-brand-900"
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block truncate text-xs font-normal text-muted">
                        {option.description}
                      </span>
                    )}
                  </span>
                  <span className="grid h-5 w-5 shrink-0 place-items-center">
                    {option.value === value && <Check size={16} className="text-brand-600" />}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted">No options available</p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
