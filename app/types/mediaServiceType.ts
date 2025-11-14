interface MediaID {
  media_id: number;
}

interface MediaIDs {
  media_ids: number[];
}

interface Files {
  files: File[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UploadMediaRequest extends Files {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DownloadMediaRequest extends MediaID {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteMediaRequest extends MediaIDs {}

export interface MediaItem {
  media_id: number;
  media_uuid: string;
  media_type: string;
  file_name: string;
  original_filepath_url: string;
  thumbnail_filepath_url?: string;
  watermark_filepath_url?: string;
  file_size: number;
  created_at: string;
}

export enum MediaTypeEnum {
  image = 1,
  video = 2,
  audio = 3,
  document = 4,
  other = 5,
}
