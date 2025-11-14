import { SeoID, ChineseTitle, ChineseDescription } from "./commonType";

interface ChineseKeywords {
  chinese_keywords: string;
}

export interface CreateSeoRequest
  extends ChineseTitle,
    ChineseDescription,
    ChineseKeywords {}

export interface UpdateSeoRequest
  extends SeoID,
    ChineseTitle,
    ChineseDescription,
    ChineseKeywords {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteSeoRequest extends SeoID {}

export interface GetSeoItemResponse {
  seo_id: number;
  title: string;
  description: string;
  keywords: string;
  created_at: string;
  updated_at?: string;
}
