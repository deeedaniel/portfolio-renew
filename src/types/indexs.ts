interface NowPlayingItem {
  album: string;
  album_image: string;
  artists: string[];
  name: string;
}

export interface NowPlayingData {
  is_playing: boolean;
  item: NowPlayingItem | null;
}

export interface TopTracksData {
  tracks: Track[];
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  album_image: string;
  spotify_url: string;
  preview_url: string;
}
