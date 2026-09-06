import { Badge } from "@/components/ui/badge";
import type { InterestLevel } from "@/lib/constants";
import { interestLevelLabel } from "@/lib/utils";

export function InterestLevelBadge({ level }: { level: InterestLevel }) {
  return <Badge variant={level}>{interestLevelLabel(level)}</Badge>;
}
