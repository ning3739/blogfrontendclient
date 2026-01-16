import type { OffsetPagination } from "@/app/types/commonType";
import type {
  ChangeMyAvatarRequest,
  DeleteUserRequest,
  EnableOrDisableUserRequest,
  GetOtherSavedBlogListsRequest,
  GetOtherUserProfileRequest,
  UpdateMyBioRequest,
} from "@/app/types/userServiceType";
import httpClient from "../http/client";

class UserService {
  async updateMyBio(payload: UpdateMyBioRequest) {
    return httpClient.patch<null>("/user/me/update-my-bio", payload);
  }

  async changeMyAvatar(payload: ChangeMyAvatarRequest) {
    return httpClient.upload<string>("/user/me/change-my-avatar", payload.file);
  }

  async getMySavedBlogLists(payload: OffsetPagination) {
    return httpClient.get("/user/me/get-my-saved-blog-lists", {
      params: payload,
    });
  }

  async getOtherUserProfile(payload: GetOtherUserProfileRequest) {
    return httpClient.get(`/user/other/get-other-user-profile/${payload.user_id}`);
  }

  async getOtherSavedBlogLists(payload: GetOtherSavedBlogListsRequest) {
    return httpClient.get("/user/other/get-other-saved-blog-lists", {
      params: payload,
    });
  }

  async enableOrDisableUser(payload: EnableOrDisableUserRequest) {
    return httpClient.patch<null>("/user/admin/enable-disable-user", payload);
  }

  async deleteUser(payload: DeleteUserRequest) {
    return httpClient.delete<null>(`/user/admin/delete-user/${payload.user_id}`);
  }
}

export const userService = new UserService();
export default userService;
