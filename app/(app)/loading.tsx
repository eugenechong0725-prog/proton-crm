export default function AppLoading() {
  return (
    <div className="grid gap-5" role="status" aria-label="Loading page">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg border bg-card" />
        ))}
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border bg-card" />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
