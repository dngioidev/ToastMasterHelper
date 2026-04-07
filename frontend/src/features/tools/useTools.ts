import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  exportSessionsRange,
  exportFull,
  downloadBackup,
  restoreBackup,
} from './tools.api';

export function useExportSessionsRange() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const mutation = useMutation({
    mutationFn: () => exportSessionsRange(from, to),
  });

  return { from, setFrom, to, setTo, mutation };
}

export function useExportFull() {
  return useMutation({ mutationFn: exportFull });
}

export function useDownloadBackup() {
  return useMutation({ mutationFn: downloadBackup });
}

export function useRestoreBackup() {
  return useMutation({ mutationFn: (file: File) => restoreBackup(file) });
}
