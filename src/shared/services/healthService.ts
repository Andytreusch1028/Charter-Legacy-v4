export type Health = {
  ok: boolean;
  ts: number;
  details?: string;
};

export async function ping(): Promise<Health> {
  try {
    // Perform a minimal async op (e.g., Date.now or a fetch to a lightweight endpoint if needed)
    return { ok: true, ts: Date.now() };
  } catch (e: any) {
    return { ok: false, ts: Date.now(), details: e?.message ?? 'unknown error' };
  }
}
