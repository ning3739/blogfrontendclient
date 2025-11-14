import httpClient from "../http/client";
import type {
  UpdateFriendRequest,
  GetFriendListRequest,
  CreateSingleFriendRequest,
  DeleteSingleFriendRequest,
  UpdateFriendListTypeRequest,
} from "@/app/types/friendServiceType";
import { handleToastResponse } from "../utils/handleToastResponse";

class FriendService {
  async getFriendDetails() {
    return httpClient.get("/friend/get-friend-details");
  }

  async getFriendList(payload: GetFriendListRequest) {
    const response = await httpClient.get(
      `/friend/get-friend-list/${payload.friend_id}`,
      { params: { limit: payload.limit, cursor: payload.cursor } }
    );
    return response;
  }

  async updateFriend(payload: UpdateFriendRequest) {
    const response = await httpClient.patch(
      "/friend/admin/update-friend",
      payload
    );
    handleToastResponse(response);
    return response;
  }

  async createSingleFriend(payload: CreateSingleFriendRequest) {
    const response = await httpClient.post(
      "/friend/create-single-friend",
      payload
    );
    handleToastResponse(response);
    return response;
  }

  async deleteSingleFriend(payload: DeleteSingleFriendRequest) {
    const response = await httpClient.delete(
      `/friend/delete-single-friend/${payload.friend_list_id}`
    );
    handleToastResponse(response);
    return response;
  }

  async updateFriendListType(payload: UpdateFriendListTypeRequest) {
    const response = await httpClient.patch(
      "/friend/admin/update-friend-list-type",
      payload
    );
    handleToastResponse(response);
    return response;
  }
}

export default new FriendService();
