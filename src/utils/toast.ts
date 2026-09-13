import { showFeedback } from '../sync-overlay';

type FeedbackKind = 'info' | 'success' | 'error';

/** @deprecated Legacy call sites are routed through the shared animated feedback foundation. */
export function showToast(message: string, kind: FeedbackKind = 'info', duration = 2200): void {
  showFeedback(message, kind, duration);
}
