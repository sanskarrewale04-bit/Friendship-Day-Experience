import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  friendship: {
    id: 'friendship',
    name: 'Eternal Friendship',
    tagline: 'Warm amber tones for lifelong bonds and unshakeable loyalty',
    bgGradient: 'from-amber-950 via-orange-900 to-amber-900',
    cardBg: 'bg-amber-950/80 border-amber-500/30 text-amber-100',
    accentColor: '#f59e0b',
    secondaryColor: '#f97316',
    textColor: 'text-amber-100',
    fontFamily: 'sans-serif',
    particles: 'hearts',
    defaultAudioTitle: 'Unforgettable Moments (Default Theme Track)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 440,
    emoji: '💛',
    clauses: [
      'The Mandatory 2 AM Venting Clause: Immediate availability for unexpected life updates and chaotic story times.',
      'The Secret Vault Pledge: All confessed embarrassments shall remain strictly classified in perpetuity.',
      'The Unconditional Loyalty Oath: Defending each other publicly, regardless of the situation.',
      'The Mutual Coffee & Chai Covenant: Spontaneous beverage summits required at least once per fortnight.'
    ]
  },
  birthday: {
    id: 'birthday',
    name: 'Celebration Blast',
    tagline: 'Vibrant neon purple & confetti sparks for the ultimate birthday honor',
    bgGradient: 'from-purple-950 via-fuchsia-900 to-indigo-950',
    cardBg: 'bg-purple-950/80 border-fuchsia-500/30 text-purple-100',
    accentColor: '#d946ef',
    secondaryColor: '#8b5cf6',
    textColor: 'text-purple-100',
    fontFamily: 'sans-serif',
    particles: 'confetti',
    defaultAudioTitle: 'Uplifting Festive Beats (Fun & Upbeat)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 523.25,
    emoji: '🎉',
    clauses: [
      'The Birthday Privilege Law: Complete immunity from mock teasing for 24 continuous hours on your birthday.',
      'The Unlimited Cake Royalty Rule: First slice guaranteed to the guest of honor without dispute.',
      'The Lifetime Memory Pact: Obligation to create at least 3 wildly unforgettable memories every single year.',
      'The Endless Cheering Guarantee: Loudest hype person in every room for all future achievements.'
    ]
  },
  love: {
    id: 'love',
    name: 'Romance & Devotion',
    tagline: 'Velvet crimson & rose petals for profound heart-to-heart connections',
    bgGradient: 'from-rose-950 via-red-900 to-pink-950',
    cardBg: 'bg-rose-950/80 border-pink-500/30 text-rose-100',
    accentColor: '#f43f5e',
    secondaryColor: '#ec4899',
    textColor: 'text-rose-100',
    fontFamily: 'serif',
    particles: 'hearts',
    defaultAudioTitle: 'Cinematic Sunset Romance (Strings & Piano)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 349.23,
    emoji: '💖',
    clauses: [
      'The Endless Support Accord: Standing by your side through every storm and every victory.',
      'The Honest Heart Promise: Sharing genuine feelings without fear of judgment.',
      'The Laughter Contract: Bringing warmth and smiles even on the hardest days.',
      'The Forever Connection Rule: No matter the physical distance, the bond remains unbreakable.'
    ]
  },
  anniversary: {
    id: 'anniversary',
    name: 'Golden Milestone',
    tagline: 'Champagne gold and luxury glimmers celebrating timeless loyalty',
    bgGradient: 'from-stone-900 via-amber-950 to-neutral-900',
    cardBg: 'bg-stone-900/90 border-yellow-500/30 text-yellow-100',
    accentColor: '#eab308',
    secondaryColor: '#ca8a04',
    textColor: 'text-yellow-100',
    fontFamily: 'serif',
    particles: 'sparkles',
    defaultAudioTitle: 'Orchestral Celebration (Elegant Strings)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 392.00,
    emoji: '🥂',
    clauses: [
      'The Years of Growth Pact: Honoring how far we have come and anticipating future chapters.',
      'The Unbroken Trust Treaty: Maintaining unwavering integrity and transparency forever.',
      'The Annual Reunion Mandate: Celebrating our milestone together with mandatory joy and toast.',
      'The Shared Journey Accord: Navigating life together with patience, kindness, and grace.'
    ]
  },
  diwali: {
    id: 'diwali',
    name: 'Festival of Lights',
    tagline: 'Warm golden diya sparks celebrating brightness, triumph, and warmth',
    bgGradient: 'from-yellow-950 via-amber-900 to-red-950',
    cardBg: 'bg-amber-950/80 border-yellow-400/40 text-amber-50',
    accentColor: '#facc15',
    secondaryColor: '#f97316',
    textColor: 'text-amber-50',
    fontFamily: 'sans-serif',
    particles: 'diyas',
    defaultAudioTitle: 'Luminous Indian Classical Fusion (Sitar & Flute)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 493.88,
    emoji: '🪔',
    clauses: [
      'The Brightness Sharing Directive: Illuminating each other’s darkest moments with hope and joy.',
      'The Sweets & Festive Truce: Zero calorie counting during festival feasts and celebrations.',
      'The Prosperity Covenant: Wishing and actively supporting each other’s lifelong success.',
      'The Warmth Guarantee: Spreading light, laughter, and positivity in every interaction.'
    ]
  },
  christmas: {
    id: 'christmas',
    name: 'Winter Wonderland',
    tagline: 'Emerald pine & falling snow crystals filled with festive warmth',
    bgGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    cardBg: 'bg-emerald-950/80 border-emerald-400/30 text-emerald-100',
    accentColor: '#10b981',
    secondaryColor: '#06b6d4',
    textColor: 'text-emerald-100',
    fontFamily: 'sans-serif',
    particles: 'snow',
    defaultAudioTitle: 'Cozy Winter Piano (Gentle Bells)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 587.33,
    emoji: '🎄',
    clauses: [
      'The Holiday Cozy Mandate: Mandatory hot cocoa/tea sessions during chilly winter evenings.',
      'The Secret Santa Oath: Exchanging thoughtful gifts and genuine gratitude every season.',
      'The Warm Hearth Agreement: Creating a safe, welcoming sanctuary whenever we meet.',
      'The New Year Hope Clause: Entering every upcoming year side-by-side with shared goals.'
    ]
  },
  newyear: {
    id: 'newyear',
    name: 'Midnight Fireworks',
    tagline: 'Cosmic deep midnight & dazzling golden sparks stepping into the future',
    bgGradient: 'from-slate-950 via-indigo-950 to-blue-950',
    cardBg: 'bg-slate-900/90 border-cyan-400/30 text-cyan-100',
    accentColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    textColor: 'text-cyan-100',
    fontFamily: 'sans-serif',
    particles: 'stars',
    defaultAudioTitle: 'Cinematic New Horizon (Ambient Synth)',
    defaultAudioUrl: 'https://www.image2url.com/r2/default/audio/1785615027221-9eef290d-761d-4638-a9f3-d56121b26d93.mp3',
    synthFrequency: 659.25,
    emoji: '🎆',
    clauses: [
      'The Future Boldness Pact: Encouraging each other to take big leaps and pursue dream goals.',
      'The Clean Slate Principle: Forgiving past misunderstandings and starting fresh together.',
      'The Midnight Toast Resolution: Celebrating every tiny win throughout the upcoming 365 days.',
      'The Unstoppable Synergy Oath: Accomplishing extraordinary milestones together in the new era.'
    ]
  }
};

export const PRESET_MESSAGES = [
  "You are the family I got to choose for myself. Thank you for making life 100x more fun, chaotic, and meaningful!",
  "To the one who knows all my weird habits, all my secrets, and still decides to be seen in public with me!",
  "Life gets crazy, but knowing you're always just a phone call away makes everything feel manageable.",
  "Through thick and thin, bad haircuts, late-night exams, and spontaneous road trips — there is no one else I'd rather have by my side.",
  "Here is to another year of unstoppable laughter, terrible inside jokes, and endless adventures together!"
];
