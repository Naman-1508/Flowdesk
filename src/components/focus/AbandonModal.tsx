"use client";

import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface AbandonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AbandonModal({ isOpen, onClose, onConfirm }: AbandonModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abandon Session?">
      <p className="text-muted font-mono mb-6 mt-2 text-sm">
        Are you sure you want to abandon this session? The time spent will still be recorded, but your focus score will be heavily penalized.
      </p>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Abandon Session
        </Button>
      </div>
    </Modal>
  );
}
