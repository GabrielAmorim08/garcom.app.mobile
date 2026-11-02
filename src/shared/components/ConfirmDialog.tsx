import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from './Button';
import { DialogDetail, DialogFrame } from './DialogFrame';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** What is about to happen, one labelled line each: shown for the heavier confirmations. */
  details?: DialogDetail[];
  confirmLabel?: string;
  cancelLabel?: string;
  /** Marks an action that is hard to undo (cancel, end), so the button is red. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** "Are you sure?" before an action the user cannot easily take back. */
export function ConfirmDialog({
  visible,
  title,
  message,
  details,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <DialogFrame
      visible={visible}
      title={title}
      message={message}
      details={details}
      onRequestClose={onCancel}>
      <Button
        label={confirmLabel ?? t('common.confirm')}
        variant={destructive ? 'danger' : 'primary'}
        loading={loading}
        onPress={onConfirm}
      />
      <Button
        label={cancelLabel ?? t('common.back')}
        variant="secondary"
        disabled={loading}
        onPress={onCancel}
      />
    </DialogFrame>
  );
}
