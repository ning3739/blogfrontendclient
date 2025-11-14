import {
  SectionID,
  ChineseTitle,
  ChineseDescription,
  ParentID,
  Comment,
  CursorPagination,
} from "./commonType";

interface BoardID {
  board_id: number;
}

interface BoardCommentID {
  board_comment_id: number;
}

export interface UpdateBoardRequest
  extends BoardID,
    SectionID,
    ChineseTitle,
    ChineseDescription {}

export interface GetBoardCommentListsRequest
  extends BoardID,
    CursorPagination {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateBoardCommentRequest extends BoardID, ParentID, Comment {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateBoardCommentRequest extends BoardCommentID, Comment {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteBoardCommentRequest extends BoardCommentID {}

export interface BoardCommentItem {
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
  children?: BoardCommentItem[];
}
