export default function Loading() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center gap-8">
      <div className="w-[260px] h-[260px] rounded-full border-[8px] border-surface2 animate-pulse" />
      <div className="h-6 w-48 bg-surface2 rounded animate-pulse" />
    </div>
  );
}
