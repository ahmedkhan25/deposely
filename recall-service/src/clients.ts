import { Response } from "express";

// In-memory SSE client map keyed by depositionId
const clients = new Map<string, Set<Response>>();

export function addClient(depositionId: string, res: Response) {
  if (!clients.has(depositionId)) {
    clients.set(depositionId, new Set());
  }
  clients.get(depositionId)!.add(res);
}

export function removeClient(depositionId: string, res: Response) {
  const set = clients.get(depositionId);
  if (set) {
    set.delete(res);
    if (set.size === 0) clients.delete(depositionId);
  }
}

export function broadcast(depositionId: string, data: object) {
  const set = clients.get(depositionId);
  if (!set) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    res.write(payload);
  }
}
