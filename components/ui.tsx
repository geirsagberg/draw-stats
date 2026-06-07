import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">{children}</main>;
}

export function Panel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-y border-ink/15 bg-paper/80 shadow-rule backdrop-blur", className)}>
      {children}
    </section>
  );
}

export function IconButton({
  children,
  label,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex size-10 items-center justify-center border border-ink/20 bg-paper transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-10 items-center gap-2 border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function AnchorButton({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "focus-ring inline-flex min-h-10 items-center gap-2 border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-signal",
        className
      )}
      {...props}
    />
  );
}
