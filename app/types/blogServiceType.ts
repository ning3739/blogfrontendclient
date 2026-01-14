import type {
  ChineseDescription,
  ChineseTitle,
  Comment,
  CursorPagination,
  CursorPaginationResponse,
  OffsetPaginationResponse,
  ParentID,
  SectionID,
  SeoID,
} from "./commonType";
import type { TiptapContent } from "./tiptapType";

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
  chinese_content: TiptapContent;
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
  extends SeoID,
    BlogTags,
    ChineseTitle,
    ChineseDescription,
    ChineseContent {
  blog_slug: string;
  cover_id: number;
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

// Blog 评论列表响应类型
export interface GetBlogCommentListsResponse {
  comments: BlogCommentItem[];
  pagination: {
    next_cursor: string | null;
    has_next: boolean;
  };
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

// Sitemap 专用类型
export interface BlogSitemapItem {
  blog_id: number;
  blog_slug: string;
  updated_at?: string;
  created_at: string;
}

export interface GetArchivedBlogListsResponse {
  blogs: GetBlogListsItem[];
  pagination: CursorPaginationResponse;
}

// 博客编辑器专用类型
export interface BlogTag {
  tag_id: number;
  tag_title: string;
  tag_slug: string;
}

export interface GetBlogEditorDetailsResponse {
  blog_id: number;
  section_id: number;
  seo_id: number | null;
  cover_id: number;
  cover_url: string;
  chinese_title: string;
  chinese_description: string;
  chinese_content: TiptapContent;
  blog_tags: BlogTag[];
}

// Blog SEO 响应类型
export interface GetBlogDetailsSeoResponse {
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  keywords: {
    zh: string;
    en: string;
  };
}
