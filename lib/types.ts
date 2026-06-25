export interface Planet {
  id: string
  name: string
  subtitle: string | null
  description: string | null
  distance: string | null
  question_prompt: string | null
  video_url: string | null
  texture_url: string | null
  bg_video_url: string | null
  sound_url: string | null
  size: number | null        // null = 자동(시드 기반)
  has_ring: boolean | null    // null = 자동, true/false = 강제
  is_visible: boolean
  created_at: string
}

export interface SiteSettings {
  id: number
  home_sound_url: string | null
}

export interface PlanetMessage {
  id: string
  planet_id: string
  content: string
  is_hidden: boolean
  created_at: string
  planets?: { name: string }
}

export interface PlanetPhoto {
  id: string
  planet_id: string
  image_url: string
  storage_path: string | null
  is_hidden: boolean
  created_at: string
  planets?: { name: string }
}

export interface VisitorSelfie {
  id: string
  image_url: string
  storage_path: string | null
  created_at: string
}

export interface VisitorLog {
  id: string
  page: string
  visited_at: string
}

export interface AdminStats {
  total_visitors: number
  total_planet_visits: number
  total_messages: number
  total_photos: number
  messages_per_planet: { planet_id: string; planet_name: string; count: number }[]
  photos_per_planet: { planet_id: string; planet_name: string; count: number }[]
}
