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
          <p>
            The app is deployed, but Supabase keys are missing on this host. Add these in
            Vercel → Project → Settings → Environment Variables (Production, Preview, and
            Development), then Redeploy:
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-muted p-3 text-xs text-foreground">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p>
            Locally, put the same values in <code>.env.local</code>. Run every file in{" "}
            <code>supabase/migrations/</code> in the Supabase SQL editor.
          </p>
          <a
            href="/demo"
            className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Open demo
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
