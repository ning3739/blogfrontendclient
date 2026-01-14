import type {
  CreateBlogCommentRequest,
  CreateBlogRequest,
  DeleteBlogCommentRequest,
  DeleteBlogRequest,
  GetBlogCommentListsRequest,
  GetBlogCommentListsResponse,
  GetBlogDetailsSeoRequest,
  GetBlogDetailsSeoResponse,
  GetBlogSummaryRequest,
  GetBlogTTSRequest,
  LikeBlogButtonRequest,
  SaveBlogButtonRequest,
  UpdateBlogCommentRequest,
  UpdateBlogRequest,
  UpdateBlogStatusRequest,
} from "@/app/types/blogServiceType";
import type { APIResponse } from "@/app/types/clientType";

import httpClient from "../http/client";

class BlogService {
  private redirectToPreview(blogSlug: string, type: string = "blog") {
    window.location.replace(`/dashboard/preview/?blogSlug=${blogSlug}&type=${type}`);
  }

  async createBlog(payload: CreateBlogRequest) {
    const response = await httpClient.post("/blog/admin/create-blog", payload);
    if (response.status === 200 && "data" in response && response.data) {
      this.redirectToPreview(response.data as string);
    }
    return response;
  }

  async updateBlog(payload: UpdateBlogRequest) {
    const response = await httpClient.patch("/blog/admin/update-blog", payload);
    if (response.status === 200 && "data" in response && response.data) {
      this.redirectToPreview(response.data as string);
    }
    return response;
  }
  async getBlogDetailsSeo(
    payload: GetBlogDetailsSeoRequest,
  ): Promise<APIResponse<GetBlogDetailsSeoResponse>> {
    return httpClient.get<GetBlogDetailsSeoResponse>(
      `/blog/get-blog-details-seo/${payload.blog_slug}`,
    );
  }

  async getBlogTTS(payload: GetBlogTTSRequest) {
    return httpClient.get(`/blog/get-blog-tts/${payload.blog_id}`);
  }

  async getBlogSummary(payload: GetBlogSummaryRequest) {
    return httpClient.get(`/blog/get-blog-summary/${payload.blog_id}`);
  }

  async getBlogCommentLists(
    payload: GetBlogCommentListsRequest,
  ): Promise<APIResponse<GetBlogCommentListsResponse>> {
    return httpClient.get<GetBlogCommentListsResponse>(
      `/blog/get-blog-comment-lists/${payload.blog_id}`,
      {
        params: { limit: payload.limit, cursor: payload.cursor },
      },
    );
  }

  async createBlogComment(payload: CreateBlogCommentRequest) {
    return httpClient.post("/blog/create-blog-comment", payload);
  }

  async updateBlogComment(payload: UpdateBlogCommentRequest) {
    return httpClient.patch("/blog/update-blog-comment", payload);
  }

  async deleteBlogComment(payload: DeleteBlogCommentRequest) {
    return httpClient.delete(`/blog/delete-blog-comment/${payload.comment_id}`);
  }

  async saveBlogButton(payload: SaveBlogButtonRequest) {
    return httpClient.post("/blog/save-blog-button", payload);
  }

  async likeBlogButton(payload: LikeBlogButtonRequest) {
    return httpClient.post("/blog/like-blog-button", payload);
  }

  async updateBlogStatus(payload: UpdateBlogStatusRequest) {
    return httpClient.patch("/blog/update-blog-status", payload);
  }

  async deleteBlog(payload: DeleteBlogRequest) {
    return httpClient.delete(`/blog/admin/delete-blog/${payload.blog_id}`);
  }
}

export const blogService = new BlogService();
export default blogService;
