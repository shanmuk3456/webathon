'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm Submission">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you absolutely certain this issue exists?
        </p>
        <p className="text-sm text-gray-500">
          Please verify that you have accurately reported the issue. False
          reports may result in point deductions.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Yes, I&apos;m certain
          </Button>
        </div>
      </div>
    </Modal>
  );
}
