export interface Movie {
  id: string;
  url?: string;
  primaryTitle: string;
  originalTitle?: string;
  description?: string;
  primaryImage?: string;
  thumbnails?: any[];
  trailer?: string;
  contentRating?: string;
  startYear?: number;
  endYear?: number | null;
  releaseDate?: string;
  interests?: string[];
  countriesOfOrigin?: string[];
  externalLinks?: string[];
  spokenLanguages?: string[];
  filmingLocations?: string[];
  productionCompanies?: any[];
  budget?: number;
  grossWorldwide?: number;
  genres?: string[];
  isAdult?: boolean;
  runtimeMinutes?: number;
  averageRating?: number;
  numVotes?: number;
  metascore?: number;
}
