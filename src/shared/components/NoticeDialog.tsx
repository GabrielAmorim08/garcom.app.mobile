import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from './Button';
import { DialogDetail, DialogFrame } from './DialogFrame';

interface NoticeDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  details?: DialogDetail[];
  okLabel?: string;
  onClose: () => void;
}

/** Tells the user an action went through. It stays until they tap OK. */
export function NoticeDialog({ visible, title, message, details, okLabel, onClose }: NoticeDialogProps) {
  const { t } = useTranslation();

  return (
    <DialogFrame
      visible={visible}
      title={title}
      message={message}
      details={details}
      onRequestClose={onClose}>
      <Button label={okLabel ?? t('common.ok')} onPress={onClose} />
    </DialogFrame>
  );
}
