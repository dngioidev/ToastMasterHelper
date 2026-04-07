import { api } from '../../lib/api';
import { useAuthStore } from '../auth/auth.store';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/** Trigger a browser file download from a blob */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSessionsRange(
  from: string,
  to: string,
): Promise<void> {
  const token = useAuthStore.getState().token;
  const res = await axios.get(`${BASE}/export/sessions`, {
    params: { from, to },
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const filename = `tm-sessions-${from}-to-${to}.xlsx`;
  downloadBlob(res.data as Blob, filename);
}

export async function exportFull(): Promise<void> {
  const token = useAuthStore.getState().token;
  const date = new Date().toISOString().split('T')[0];
  const res = await axios.get(`${BASE}/export/full`, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  downloadBlob(res.data as Blob, `tm-full-export-${date}.xlsx`);
}

export async function downloadBackup(): Promise<void> {
  const token = useAuthStore.getState().token;
  const date = new Date().toISOString().split('T')[0];
  const res = await axios.get(`${BASE}/backup/download`, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  downloadBlob(res.data as Blob, `tm-backup-${date}.json`);
}

export async function restoreBackup(
  file: File,
): Promise<{ restored: number }> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file — please select a valid backup file.');
  }
  const res = await api.post<{ restored: number }>('/backup/restore', parsed);
  return res.data;
}
