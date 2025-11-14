import {
  CursorPagination,
  SectionID,
  SeoID,
  ChineseTitle,
  ChineseDescription,
  ParentID,
  Comment,
  OffsetPaginationResponse,
  CursorPaginationResponse,
} from "./commonType";

interface BlogTags {
  blog_tags: number[];
}

export interface BlogID {
  blog_id: number;
}

interface CommentID {
  comment_id: number;
}

interface ChineseContent {
  chinese_content: string;
}

export interface CreateBlogRequest
  extends SectionID,
    SeoID,
    ChineseTitle,
    ChineseDescription,
    BlogTags,
    ChineseContent {
  cover_id: number;
}

export interface UpdateBlogRequest
  extends ChineseTitle,
    ChineseDescription,
    ChineseContent {
  blog_slug: string;
}

export interface GetBlogDetailsSeoRequest {
  blog_slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetBlogTTSRequest extends BlogID {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetBlogSummaryRequest extends BlogID {}

export interface GetBlogCommentListsRequest extends BlogID, CursorPagination {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateBlogCommentRequest extends BlogID, ParentID, Comment {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateBlogCommentRequest extends CommentID, Comment {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteBlogCommentRequest extends CommentID {}

export interface BlogCommentItem {
  comment_id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  user_role: string;
  city: string;
  parent_id: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  children?: BlogCommentItem[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SaveBlogButtonRequest extends BlogID {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LikeBlogButtonRequest extends BlogID {}

export interface BlogItemDashboardResponse {
  section_slug: string;
  blog_id: number;
  blog_slug: string;
  blog_title: string;
  blog_description: string;
  cover_url: string;
  blog_tags: {
    tag_id: number;
    tag_title: string;
  }[];
  blog_stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
  };
  is_published: boolean;
  is_archived: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UpdateBlogStatusRequest {
  blog_id: number;
  is_published?: boolean;
  is_archived?: boolean;
  is_featured?: boolean;
}

export interface GetBlogListsItemResponse {
  blog_id: number;
  blog_slug: string;
  blog_title: string;
  blog_description: string;
  cover_url: string;
  blog_tags: {
    tag_id: number;
    tag_title: string;
  }[];
  blog_stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface GetBlogDetailsResponse {
  blog_id: number;
  blog_name: string;
  blog_description: string;
  cover_url: string;
  blog_content: string;
  is_saved: boolean;
  blog_tags: {
    tag_id: number;
    tag_slug: string;
    tag_title: string;
  }[];
  blog_stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface GetBlogNavigationResponse {
  previous?: {
    section_slug: string;
    blog_slug: string;
    blog_title: string;
  };
  next?: {
    section_slug: string;
    blog_slug: string;
    blog_title: string;
  };
}

export interface GetBlogStatsResponse {
  views: number;
  likes: number;
  comments: number;
  saves: number;
}

export interface DeleteBlogRequest extends BlogID {}

export interface GetRecentPopulorBlogItem {
  blog_id: number;
  section_slug: string;
  blog_slug: string;
  blog_title: string;
  blog_description: string;
  cover_url: string;
  blog_tags: {
    tag_id: number;
    tag_title: string;
  }[];
  blog_stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
  };
  created_at: string;
}

export type GetRecentPopulorBlogResponse = GetRecentPopulorBlogItem[];

export interface GetBlogListsItem {
  blog_id: number;
  blog_slug: string;
  section_slug: string;
  blog_title: string;
  blog_description: string;
  created_at: string;
  updated_at?: string;
}

export interface GetBlogListsByTagSlugResponse {
  items: GetBlogListsItem[];
  pagination: OffsetPaginationResponse;
}

export interface GetArchivedBlogListsResponse {
  blogs: GetBlogListsItem[];
  pagination: CursorPaginationResponse;
}
