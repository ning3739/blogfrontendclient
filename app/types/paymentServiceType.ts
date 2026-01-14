import type { OffsetPagination } from "@/app/types/commonType";
import type { ProjectIDSchema } from "@/app/types/projectServiceType";

export interface CreatePaymentIntentRequest extends ProjectIDSchema {
  cover_url: string;
  project_name: string;
  project_description: string;
  project_price: number;
  tax_name: string;
  tax_rate: number;
  tax_amount: number;
  final_amount: number;
}

export type GetPaymentRecordsRequest = OffsetPagination;

export interface PaymentSuccessDetails {
  payment_intent_id: string;
  payment_status: string;
  order_number: string;
  payment_date: number;
  user: {
    user_id: number;
    user_name: string;
    user_email: string;
  };
  project: {
    project_id: number;
    cover_url: string;
    project_name: string;
    project_description: string;
    project_price: number;
    project_section_name: string;
    project_slug: string;
  };
  tax: {
    tax_name: string;
    tax_rate: number;
    tax_amount: number;
  };
  final_amount: number;
  payment_type: string;
}

export interface GetPaymentRecordsItems {
  payment_id: number;
  order_number: string;
  payment_type: string;
  amount: number;
  payment_status: string;
  created_at: string;
  user?: {
    user_id: number;
    username: string;
    email: string;
  };
  project: {
    project_id: number;
    project_title: string;
    project_slug: string;
  };
  attachment_id?: number;
}

// Create Payment Intent 响应类型
export interface CreatePaymentIntentResponse {
  client_secret: string;
}
