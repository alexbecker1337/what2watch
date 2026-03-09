export interface Mood {
  id: string;
  label: string;
  emoji: string;
  description: string;
  movieGenres: number[];
  tvGenres: number[];
  keywords: string;
  sortBy: string;
  color: string;
}

// TMDB Genre IDs:
// Movie: Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80,
//        Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36,
//        Horror=27, Music=10402, Mystery=9648, Romance=10749, SciFi=878,
//        Thriller=53, War=10752, Western=37
// TV:    Action&Adventure=10759, Animation=16, Comedy=35, Crime=80,
//        Documentary=99, Drama=18, Family=10751, Kids=10762, Mystery=9648,
//        News=10763, Reality=10764, SciFi&Fantasy=10765, Soap=10766,
//        Talk=10767, War&Politics=10768, Western=37

export const MOODS: Mood[] = [
  {
    id: "feel-good",
    label: "Feel-Good",
    emoji: "😊",
    description: "Uplifting, warm, leaves you smiling",
    movieGenres: [35, 10749, 10751],
    tvGenres: [35, 10751],
    keywords: "uplifting,feel-good,heartwarming",
    sortBy: "popularity.desc",
    color: "from-yellow-400 to-orange-400",
  },
  {
    id: "cozy",
    label: "Cozy Night In",
    emoji: "🛋️",
    description: "Low-stakes, comforting, easy to follow",
    movieGenres: [35, 10751, 10749],
    tvGenres: [35, 10751, 18],
    keywords: "cozy,small town,comfort",
    sortBy: "vote_average.desc",
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: "mind-bending",
    label: "Mind-Bending",
    emoji: "🌀",
    description: "Twists, puzzles, makes you think",
    movieGenres: [878, 9648, 53],
    tvGenres: [9648, 10765, 18],
    keywords: "psychological,twist ending,mind bending",
    sortBy: "vote_average.desc",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "adrenaline",
    label: "Adrenaline Rush",
    emoji: "⚡",
    description: "High-octane action, non-stop energy",
    movieGenres: [28, 12, 53],
    tvGenres: [10759, 80],
    keywords: "action,chase,survival,explosive",
    sortBy: "popularity.desc",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "dark-gritty",
    label: "Dark & Gritty",
    emoji: "🌑",
    description: "Intense, raw, morally complex",
    movieGenres: [80, 18, 53],
    tvGenres: [80, 18],
    keywords: "dark,noir,gritty,crime",
    sortBy: "vote_average.desc",
    color: "from-gray-700 to-gray-900",
  },
  {
    id: "laugh-out-loud",
    label: "Laugh Out Loud",
    emoji: "😂",
    description: "Pure comedy, no strings attached",
    movieGenres: [35],
    tvGenres: [35],
    keywords: "comedy,funny,hilarious",
    sortBy: "popularity.desc",
    color: "from-green-400 to-teal-400",
  },
  {
    id: "emotional",
    label: "Emotional Journey",
    emoji: "💧",
    description: "Moving stories that hit deep",
    movieGenres: [18, 10749],
    tvGenres: [18],
    keywords: "emotional,tearjerker,moving,drama",
    sortBy: "vote_average.desc",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "scary",
    label: "Scared to Sleep",
    emoji: "👻",
    description: "Horror, dread, and jump scares",
    movieGenres: [27, 53],
    tvGenres: [27, 9648],
    keywords: "horror,scary,supernatural,ghost",
    sortBy: "vote_average.desc",
    color: "from-red-900 to-gray-900",
  },
];
