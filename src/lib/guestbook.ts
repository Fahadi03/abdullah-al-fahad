import { getRedis } from "./redis";

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: number;
}

const PENDING_KEY = "guestbook:pending";
const APPROVED_KEY = "guestbook:approved";

function parseEntries(raw: unknown[]): GuestbookEntry[] {
  return raw
    .map((item) => {
      try {
        return typeof item === "string" ? (JSON.parse(item) as GuestbookEntry) : (item as GuestbookEntry);
      } catch {
        return null;
      }
    })
    .filter((entry): entry is GuestbookEntry => entry !== null);
}

/** Newest first — entries are LPUSHed, so index 0 already is the newest. */
export async function getApprovedEntries(): Promise<GuestbookEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(APPROVED_KEY, 0, -1);
    return parseEntries(raw);
  } catch (error) {
    console.error("guestbook: failed to read approved entries", error);
    return [];
  }
}

export async function getPendingEntries(): Promise<GuestbookEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(PENDING_KEY, 0, -1);
    return parseEntries(raw);
  } catch (error) {
    console.error("guestbook: failed to read pending entries", error);
    return [];
  }
}

export async function submitEntry(name: string, message: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const entry: GuestbookEntry = { id: crypto.randomUUID(), name, message, createdAt: Date.now() };
  try {
    await redis.lpush(PENDING_KEY, JSON.stringify(entry));
    return true;
  } catch (error) {
    console.error("guestbook: failed to submit entry", error);
    return false;
  }
}

/** Pending is small (moderation queue) — read/filter/rewrite is simplest and plenty fast at this scale. */
export async function moderateEntry(id: string, action: "approve" | "reject"): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const pending = await getPendingEntries();
    const entry = pending.find((item) => item.id === id);
    if (!entry) return false;

    const remaining = pending.filter((item) => item.id !== id);

    const pipeline = redis.pipeline();
    pipeline.del(PENDING_KEY);
    if (remaining.length > 0) {
      pipeline.rpush(PENDING_KEY, ...remaining.map((item) => JSON.stringify(item)));
    }
    if (action === "approve") {
      pipeline.lpush(APPROVED_KEY, JSON.stringify(entry));
    }
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error("guestbook: failed to moderate entry", error);
    return false;
  }
}
