interface Size {
  size: number;
}

interface Limit {
  limit: number;
}

export interface UserID {
  user_id: number;
}

export interface SectionID {
  section_id: number;
}

export interface SeoID {
  seo_id: number;
}

export interface ChineseTitle {
  chinese_title: string;
}

export interface ChineseDescription {
  chinese_description: string;
}

export interface ParentID {
  parent_id?: number | null;
}

export interface Comment {
  comment: string;
}

export interface NumberType {
  type: number;
}

export interface StringType {
  type: string;
}

export interface IsActive {
  is_active: boolean;
}

export interface Title {
  title: string;
}

export interface Description {
  description: string;
}

export interface CreatedAt {
  created_at: string;
}

export interface Slug {
  slug: string;
}

export interface UpdatedAt {
  updated_at: string | null;
}

export interface OffsetPagination extends Size {
  page: number;
}

export interface CursorPagination extends Limit {
  cursor?: string;
}

export interface OffsetPaginationResponse {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
  start_index: number;
  end_index: number;
  new_items_this_month?: number;
  updated_items_this_month?: number;
  active_users?: number;
  total_amount_this_month?: number;
}

export interface CursorPaginationResponse {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  next_cursor?: string;
  prev_cursor?: string;
  count: number;
}
