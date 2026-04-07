import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useExportFull,
  useDownloadBackup,
  useRestoreBackup,
} from './useTools';
import * as toolsApi from './tools.api';

vi.mock('./tools.api');

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => { vi.clearAllMocks(); });

describe('useExportFull', () => {
  it('calls exportFull on mutate', async () => {
    vi.mocked(toolsApi.exportFull).mockResolvedValue(undefined);
    const { result } = renderHook(() => useExportFull(), {
      wrapper: makeWrapper(),
    });
    await act(async () => result.current.mutate());
    expect(toolsApi.exportFull).toHaveBeenCalledTimes(1);
  });
});

describe('useDownloadBackup', () => {
  it('calls downloadBackup on mutate', async () => {
    vi.mocked(toolsApi.downloadBackup).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDownloadBackup(), {
      wrapper: makeWrapper(),
    });
    await act(async () => result.current.mutate());
    expect(toolsApi.downloadBackup).toHaveBeenCalledTimes(1);
  });
});

describe('useRestoreBackup', () => {
  it('calls restoreBackup with the file', async () => {
    vi.mocked(toolsApi.restoreBackup).mockResolvedValue({ restored: 5 });
    const { result } = renderHook(() => useRestoreBackup(), {
      wrapper: makeWrapper(),
    });
    const file = new File(['{}'], 'backup.json', { type: 'application/json' });
    await act(async () => result.current.mutate(file));
    expect(toolsApi.restoreBackup).toHaveBeenCalledWith(file);
  });
});
