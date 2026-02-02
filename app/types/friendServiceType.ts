import type { ChineseDescription, ChineseTitle, CursorPagination, NumberType } from "./commonType";

interface FriendID {
  friend_id: number;
}

interface FriendListID {
  friend_list_id: number;
}

interface LogoURL {
  logo_url: string;
}

interface SiteURL {
  site_url: string;
}

export interface UpdateFriendRequest extends FriendID, ChineseTitle, ChineseDescription {
  // Intentionally empty - combines multiple interfaces
}

export interface GetFriendListRequest extends FriendID, CursorPagination {}

export interface CreateSingleFriendRequest
  extends FriendID,
    LogoURL,
    SiteURL,
    ChineseTitle,
    ChineseDescription {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteSingleFriendRequest extends FriendListID {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateFriendListTypeRequest extends FriendListID, NumberType {}

export interface GetFriendListItemsResponse {
  id: number;
  type_name: string;
  logo_url: string;
  site_url: string;
  title: string;
  description: string;
  created_at: string;
  updated_at?: string;
}

// 辅助函数：从 type_name 获取 FriendType 枚举值
export const getFriendTypeFromName = (typeName: string): FriendType => {
  switch (typeName) {
    case "featured":
      return FriendType.featured;
    case "normal":
      return FriendType.normal;
    case "hidden":
      return FriendType.hidden;
    default:
      return FriendType.normal;
  }
};

export enum FriendType {
  featured = 1,
  normal = 2,
  hidden = 3,
}

// Friend List 响应类型
export interface GetFriendListResponse {
  friend_lists: GetFriendListItemsResponse[];
  pagination: {
    next_cursor: string | null;
    has_next: boolean;
  };
}
