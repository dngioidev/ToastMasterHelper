import { useRef, useState } from 'react';
import {
  useDownloadBackup,
  useExportFull,
  useExportSessionsRange,
  useRestoreBackup,
} from './useTools';

export function ToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <p className="text-sm text-gray-500 mt-1">
          Export data to Excel and manage system backups.
        </p>
      </div>

      <ExportRangeSection />
      <ExportFullSection />
      <BackupRestoreSection />
    </div>
  );
}

// ─── Export by date range ─────────────────────────────────────────────────────

function ExportRangeSection() {
  const { from, setFrom, to, setTo, mutation } = useExportSessionsRange();

  const isValid = from && to && from <= to;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) mutation.mutate();
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Export Sessions by Date Range
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Download an Excel file with online and offline sessions between two
          dates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="export-from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From
          </label>
          <input
            id="export-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="export-to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To
          </label>
          <input
            id="export-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || mutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>📥</span>
          {mutation.isPending ? 'Generating…' : 'Download Excel'}
        </button>
      </form>

      {mutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Export failed. Please try again.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-green-600">
          Excel file downloaded successfully.
        </p>
      )}
    </section>
  );
}

// ─── Full system export ───────────────────────────────────────────────────────

function ExportFullSection() {
  const mutation = useExportFull();

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Full System Export
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Download a single Excel workbook with all members, all online
          sessions, all offline sessions, and member analytics.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap text-sm text-gray-600">
        <SheetBadge label="Members" color="blue" />
        <SheetBadge label="Online Sessions" color="green" />
        <SheetBadge label="Offline Sessions" color="purple" />
        <SheetBadge label="Member Analytics" color="orange" />
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>📊</span>
        {mutation.isPending ? 'Generating…' : 'Download Full Export'}
      </button>

      {mutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Export failed. Please try again.'}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-green-600">
          Full export downloaded successfully.
        </p>
      )}
    </section>
  );
}

// ─── Backup & Restore ─────────────────────────────────────────────────────────

function BackupRestoreSection() {
  const backupMutation = useDownloadBackup();
  const restoreMutation = useRestoreBackup();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function confirmRestore() {
    if (!pendingFile) return;
    restoreMutation.mutate(pendingFile, {
      onSettled: () => {
        setPendingFile(null);
        setConfirmOpen(false);
      },
    });
  }

  function cancelRestore() {
    setPendingFile(null);
    setConfirmOpen(false);
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Backup &amp; Restore
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Download a complete JSON backup or restore the system from a previous
          backup file.
        </p>
      </div>

      {/* Backup */}
      <div className="flex items-start gap-4 py-4 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Download Backup</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Exports all members, sessions, and assignments as a JSON file.
          </p>
        </div>
        <button
          onClick={() => backupMutation.mutate()}
          disabled={backupMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <span>💾</span>
          {backupMutation.isPending ? 'Downloading…' : 'Backup'}
        </button>
      </div>

      {backupMutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          Backup failed. Please try again.
        </p>
      )}
      {backupMutation.isSuccess && (
        <p className="text-sm text-green-600">Backup downloaded.</p>
      )}

      {/* Restore */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Restore from Backup</p>
          <p className="text-xs text-gray-500 mt-0.5">
            <strong className="text-amber-600">Warning:</strong> This will
            replace ALL existing data with the contents of the selected backup
            file. This action cannot be undone.
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={restoreMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          <span>📂</span>
          {restoreMutation.isPending ? 'Restoring…' : 'Restore'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Select backup JSON file"
        />
      </div>

      {restoreMutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {restoreMutation.error instanceof Error
            ? restoreMutation.error.message
            : 'Restore failed. Please check your backup file and try again.'}
        </p>
      )}
      {restoreMutation.isSuccess && (
        <p className="text-sm text-green-600">
          Restore complete —{' '}
          {restoreMutation.data?.restored ?? 0} records imported.
        </p>
      )}

      {/* Confirmation dialog */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-restore-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3
              id="confirm-restore-title"
              className="text-base font-semibold text-gray-900"
            >
              Confirm Restore
            </h3>
            <p className="text-sm text-gray-600">
              You are about to restore from{' '}
              <strong>{pendingFile?.name}</strong>. This will{' '}
              <strong className="text-red-600">permanently delete</strong> all
              current data and replace it with the backup. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRestore}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

function SheetBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[color] ?? ''}`}
    >
      {label}
    </span>
  );
}
