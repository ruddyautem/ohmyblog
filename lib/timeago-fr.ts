import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatTimeAgo(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return "";
  }
}

