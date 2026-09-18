export default function Loading() {
  return (
    <div className="space-y-8 sm:space-y-12 animate-pulse py-4">
      {/* Hero Skeleton */}
      <div className="h-64 sm:h-80 w-full rounded-2xl sm:rounded-3xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />

      {/* Content Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-44 w-full rounded-2xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />
          <div className="h-44 w-full rounded-2xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />
          <div className="h-44 w-full rounded-2xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="h-56 w-full rounded-2xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />
          <div className="h-44 w-full rounded-2xl bg-zinc-100 dark:bg-[#121826]/70 border border-zinc-200/60 dark:border-slate-800/80" />
        </div>
      </div>
    </div>
  );
}
