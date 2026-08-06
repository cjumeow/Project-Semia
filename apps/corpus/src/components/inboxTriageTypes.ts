export type InboxTriageAction = 'processed' | 'delete';

export type InboxProcessTrigger = {
  snippetId: string;
  nonce: number;
};
