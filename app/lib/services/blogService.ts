import type {
  CreateBlogRequest,
  UpdateBlogRequest,
  GetBlogDetailsSeoRequest,
  GetBlogTTSRequest,
  GetBlogSummaryRequest,
  GetBlogCommentListsRequest,
  CreateBlogCommentRequest,
  UpdateBlogCommentRequest,
  DeleteBlogCommentRequest,
  SaveBlogButtonRequest,
  LikeBlogButtonRequest,
  UpdateBlogStatusRequest,
  DeleteBlogRequest,
} from "@/app/types/blogServiceType";

import httpClient from "../http/client";
import { handleToastResponse } from "../utils/handleToastResponse";

class BlogService {
  async createBlog(payload: CreateBlogRequest) {
    const response = await httpClient.post("/blog/admin/create-blog", payload);
    handleToastResponse(response);
    if (response.status === 200 && "data" in response) {
      window.location.replace(
        `/dashboard/preview/?blogSlug=${response.data}&type=blog`
      );
    }
    return response;
  }
  async updateBlog(payload: UpdateBlogRequest) {
    const response = await httpClient.patch("/blog/admin/update-blog", payload);
    handleToastResponse(response);
    if (response.status === 200 && "data" in response) {
      window.location.replace(
        `/dashboard/preview/?blogSlug=${response.data}&type=blog`
      );
    }
    return response;
  }
  async getBlogDetailsSeo(payload: GetBlogDetailsSeoRequest) {
    return httpClient.get(`/blog/get-blog-details-seo/${payload.blog_slug}`);
  }

  async getBlogTTS(payload: GetBlogTTSRequest) {
    return httpClient.get(`/blog/get-blog-tts/${payload.blog_id}`);
  }
  async getBlogSummary(payload: GetBlogSummaryRequest) {
    return httpClient.get(`/blog/get-blog-summary/${payload.blog_id}`);
  }
  async getBlogCommentLists(payload: GetBlogCommentListsRequest) {
    return httpClient.get(`/blog/get-blog-comment-lists/${payload.blog_id}`, {
      params: {
        limit: payload.limit,
        cursor: payload.cursor,
      },
    });
  }
  async createBlogComment(payload: CreateBlogCommentRequest) {
    const response = await httpClient.post(
      "/blog/create-blog-comment",
      payload
    );
    handleToastResponse(response);
    return response;
  }
  async updateBlogComment(payload: UpdateBlogCommentRequest) {
    const response = await httpClient.patch(
      "/blog/update-blog-comment",
      payload
    );
    handleToastResponse(response);
    return response;
  }
  async deleteBlogComment(payload: DeleteBlogCommentRequest) {
    const response = await httpClient.delete(
      `/blog/delete-blog-comment/${payload.comment_id}`
    );
    handleToastResponse(response);
    return response;
  }
  async saveBlogButton(payload: SaveBlogButtonRequest) {
    const response = await httpClient.post("/blog/save-blog-button", payload);
    handleToastResponse(response);
    return response;
  }

  async likeBlogButton(payload: LikeBlogButtonRequest) {
    const response = await httpClient.post("/blog/like-blog-button", payload);
    handleToastResponse(response);
    return response;
  }

  async updateBlogStatus(payload: UpdateBlogStatusRequest) {
    const response = await httpClient.patch(
      "/blog/update-blog-status",
      payload
    );
    handleToastResponse(response);
    return response;
  }

  async deleteBlog(payload: DeleteBlogRequest) {
    const response = await httpClient.delete(
      `/blog/admin/delete-blog/${payload.blog_id}`
    );
    handleToastResponse(response);
    return response;
  }
}

export default new BlogService();
