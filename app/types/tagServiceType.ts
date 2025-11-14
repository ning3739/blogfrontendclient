import { ChineseTitle } from "./commonType";

interface TagID {
  tag_id: number;
}

export interface CreateTagRequest extends ChineseTitle {
  // Intentionally empty - extends ChineseTitle interface
}

export interface UpdateTagRequest extends TagID, ChineseTitle {
  // Intentionally empty - combines TagID and ChineseTitle
}

export interface DeleteTagRequest extends TagID {
  // Intentionally empty - extends TagID interface
}

export interface GetTagItemResponse {
  tag_id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at?: string;
}
