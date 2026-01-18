export interface NowPlayingData {
  is_playing: boolean;
  item: NowPlayingItem | null;
}

interface NowPlayingItem {
  album: string;
  album_image: string;
  artists: string[];
  name: string;
  spotify_url: string;
  preview_url: string | null;
}

export interface TopTracksData {
  tracks: Track[];
}

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  album_image: string;
  spotify_url: string;
  preview_url: string | null;
}

export interface LeetCodeData {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  submissionCalendar: {
    [timestamp: string]: number;
  };
}
