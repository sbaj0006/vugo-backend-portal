import { MovieRating } from '@/enums/MovieRating';

export interface IUpdateTitleRequest {
  url: string;
  hlsUrl: string;
  title: string;
  subTitle: string;
  mediaFile: string;
  assetId: string;
  longDescription: string;
  shortDescription: string;
  rating: MovieRating;
  year: number;
  genre: string;
  duration: number;
  posterUrl: string;
  bannerUrl: string;
  banner16x9_url: string;
  banner4x1_url: string;
  banner4x3_url: string;
  banner3x4_url: string;
  artworkUrl: string;
  trailerMediaFile: string;
  trailerDashUrl: string;
  trailerHlsUrl: string;
  promoMediaFile: string;
  promoHlsUrl: string;
  promoDashUrl: string;
}
