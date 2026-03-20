import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  supabaseUserId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  tenantId?: string;
}

export interface YCloudWebhookBody {
  id: string;
  type: string;
  whatsappInboundMessage?: {
    wabaId: string;
    from: string;
    to: string;
    text?: { body: string };
    type: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
}
