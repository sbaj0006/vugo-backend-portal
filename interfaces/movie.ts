import { Genre } from '@/enums/Genre';
import { MovieRating } from '@/enums/MovieRating';
import { bool } from 'aws-sdk/clients/signer';

export interface Movie {
  index: number;
  id: string;
  assetId: string;
  dashUrl: string;
  hlsUrl: string;
  titleName: string;
  subTitle: string;
  mediaFile: string;
  longDescription: string;
  shortDescription: string;
  rating: string;
  ratingEnum: MovieRating;
  year: number;
  genre: string;
  genres: Genre[];
  duration: number;
  posterUrl: string;
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
  published: bool;
}
