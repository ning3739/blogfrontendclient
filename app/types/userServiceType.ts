import { UserID, OffsetPagination, IsActive } from "./commonType";

interface Bio {
  bio: string;
}

interface Avatar {
  file: File;
}

export interface UpdateMyBioRequest extends Bio {
  // Intentionally empty - extends Bio interface
}

export interface ChangeMyAvatarRequest extends Avatar {
  // Intentionally empty - extends Avatar interface
}

export interface GetMyPaymentRecordRequest extends OffsetPagination {
  // Intentionally empty - extends OffsetPagination interface
}

export interface GetMySavedBlogListsRequest extends OffsetPagination {
  // Intentionally empty - extends OffsetPagination interface
}

export interface GetOtherUserProfileRequest extends UserID {
  // Intentionally empty - extends UserID interface
}

export interface GetOtherSavedBlogListsRequest
  extends UserID,
    OffsetPagination {
  // Intentionally empty - combines UserID and OffsetPagination
}

export interface GetUserListsRequest extends OffsetPagination {
  // Intentionally empty - extends OffsetPagination interface
}

export interface EnableOrDisableUserRequest extends UserID, IsActive {
  // Intentionally empty - combines UserID and IsActive
}

export interface DeleteUserRequest extends UserID {
  // Intentionally empty - extends UserID interface
}

export interface UserResponse {
  user_id: number;
  username: string;
  email: string;
  role: string;
  avatar_url: string;
  bio: string;
  city: string;
  ip_address: string;
  longitude: number;
  latitude: number;
  is_active: boolean;
  is_verified: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface GetMySavedBlogItemResponse {
  cover_url: string;
  section_slug: string;
  blog_id: number;
  blog_slug: string;
  blog_title: string;
  saved_at: string;
}
