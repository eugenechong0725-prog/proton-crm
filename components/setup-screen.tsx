import { BrandMark } from "@/components/layout/brand-mark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <BrandMark />
          <CardTitle className="mt-4">Connect Supabase to start</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
          <p>Create a Supabase project, then add these to <code>.env.local</code>:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-muted p-3 text-xs text-foreground">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p>
            Run <code>supabase/migrations/001_init.sql</code> in the Supabase SQL editor. That
            creates the tables, indexes, and row-level security so each salesperson only sees
            their own customers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
