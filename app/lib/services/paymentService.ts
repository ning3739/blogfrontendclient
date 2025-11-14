import httpClient from "../http/client";
import type {
  CreatePaymentIntentRequest,
  GetPaymentRecordsRequest,
} from "@/app/types/paymentServiceType";

class PaymentService {
  async createPaymentIntent(payload: CreatePaymentIntentRequest) {
    return httpClient.post("/payment/create-payment-intent", payload);
  }

  async stripeWebhook() {
    return httpClient.post("/payment/stripe-webhook");
  }

  async getPaymentRecords(payload: GetPaymentRecordsRequest) {
    return httpClient.get("/payment/get-payment-records", {
      params: { ...payload },
    });
  }
}

export default new PaymentService();
