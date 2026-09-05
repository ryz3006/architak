export type NotificationPayload = {
  type: "new_enquiry";
  enquiryId: string;
  title: string;
  body: string;
  url?: string;
};

export type NotificationErrorCategory =
  | "config"
  | "auth"
  | "network"
  | "rate_limit"
  | "api"
  | "timeout"
  | "unknown";

export type NotificationResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  errorCategory?: NotificationErrorCategory;
  durationMs: number;
};

export type ProviderStatus = {
  enabled: boolean;
  configured: boolean;
  status: "operational" | "configured" | "disabled" | "not_configured" | "error";
};

export interface NotificationProvider {
  readonly name: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  test(): Promise<NotificationResult>;
  getStatus(): ProviderStatus;
}
