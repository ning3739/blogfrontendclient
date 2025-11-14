import httpClient from "../http/client";
import type { Email } from "@/app/types/authServiceType";
import { handleToastResponse } from "../utils/handleToastResponse";

export const SubscriberService = {
  getSubscriberLists: async (page: number, size: number) => {
    return await httpClient.get("/subscriber/admin/get-subscriber-lists", {
      params: { page, size },
    });
  },

  createSubscriber: async (payload: Email) => {
    const response = await httpClient.post(
      "/subscriber/create-subscriber",
      payload
    );
    handleToastResponse(response);
    return response;
  },

  unsubscribeSubscriber: async (payload: Email) => {
    const response = await httpClient.post(
      "/subscriber/unsubscribe-subscriber",
      payload
    );
    handleToastResponse(response);
    return response;
  },
};
