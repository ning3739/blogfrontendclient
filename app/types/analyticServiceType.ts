// Analytics Service Types

export interface UserLocation {
  city: string;
  longitude: number;
  latitude: number;
}

export interface BlogStatistics {
  total_blogs: number;
  published_blogs: number;
  archived_blogs: number;
  featured_blogs: number;
  new_blogs_this_month: number;
  updated_blogs_this_month: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_saves: number;
  section_distribution: Array<{
    section: string;
    count: number;
  }>;
}

export interface BlogPerformer {
  blog_slug: string;
  section_slug: string;
  title: string;
  views?: number;
  likes?: number;
  comments?: number;
  saves?: number;
}

export interface BlogTopPerformers {
  top_views: BlogPerformer[];
  top_likes: BlogPerformer[];
  top_comments: BlogPerformer[];
  top_saves: BlogPerformer[];
}

export interface TagStatistic {
  tag_slug: string;
  chinese_title: string;
  blog_count: number;
}

export interface ProjectStatistics {
  total_projects: number;
  published_projects: number;
  new_projects_this_month: number;
  type_distribution: {
    [key: string]: number;
  };
  section_distribution: Array<{
    section: string;
    count: number;
  }>;
}

export interface PaymentStatistics {
  total_revenue: number;
  total_payments: number;
  successful_payments: number;
  monthly_revenue: number;
  monthly_payments: number;
  yearly_revenue: number;
  total_tax: number;
  payment_type_distribution: {
    [key: string]: number;
  };
  payment_status_distribution: {
    [key: string]: number;
  };
}

export interface RevenueProject {
  project_slug: string;
  title: string;
  total_revenue: number;
  payment_count: number;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
}

export interface MediaStatistics {
  total_media: number;
  avatar_count: number;
  new_media_this_month: number;
}

export interface GrowthTrend {
  date: string;
  count?: number;
  revenue?: number;
}

export interface GrowthTrends {
  user_growth: GrowthTrend[];
  blog_growth: GrowthTrend[];
  revenue_growth: GrowthTrend[];
}

export interface OverviewStatistics {
  users: {
    total: number;
  };
  blogs: {
    total: number;
  };
  projects: {
    total: number;
  };
  payments: {
    total_revenue: number;
  };
  media: {
    total: number;
  };
}
