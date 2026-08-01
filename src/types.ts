export type ThemeId =
  | 'friendship'
  | 'birthday'
  | 'love'
  | 'anniversary'
  | 'diwali'
  | 'christmas'
  | 'newyear';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  particles: 'hearts' | 'sparkles' | 'confetti' | 'stars' | 'diyas' | 'snow';
  defaultAudioTitle: string;
  synthFrequency: number;
  emoji: string;
  clauses: string[];
}

export interface SignatureData {
  type: 'draw' | 'type';
  dataUrl?: string; // canvas PNG data url
  signatureDataUrl?: string; // fallback alias
  typedName?: string;
  signedAt: string;
}

export interface PhotoItem {
  id: string;
  url: string; // base64 or photo URL
  caption?: string;
  date?: string;
  location?: string;
}

export interface CommitmentItem {
  id: string;
  number: number;
  icon: string; // icon key or emoji
  title: string;
  description: string;
  accentColor?: string;
}

export interface VisitorLog {
  timestamp: string;
  userAgent?: string;
}

export interface ShareAnalytics {
  whatsapp: number;
  telegram: number;
  facebook?: number;
  directCopy: number;
}

export interface OpeningConfig {
  openingHeading: string;
  openingMessage: string;
  messageStyle: 'romantic' | 'best_friends' | 'funny' | 'emotional' | 'cute' | 'minimal' | 'formal' | 'custom';
  typingSpeed: 'slow' | 'normal' | 'fast';
  textAnimation: 'typewriter' | 'letter_reveal' | 'fade_up' | 'blur_reveal' | 'scale_in' | 'glow_reveal' | 'handwriting' | 'floating_letters';
  backgroundEffect: 'hearts' | 'sparkles' | 'fireflies' | 'stars' | 'bubbles' | 'confetti' | 'none';
  musicTiming: 'immediately' | 'after_message' | 'after_button_click' | 'manual';
  continueButtonText: string;
}

export interface FriendshipCard {
  id: string;
  agreementId: string;
  certificateId: string;
  themeId: ThemeId;
  friendName: string;
  friendNickname?: string;
  senderName: string;
  customMessage: string;
  openingConfig?: OpeningConfig;
  friendPhotoUrl?: string; // legacy fallback / primary photo
  photos: PhotoItem[]; // Up to 20 images for multi-photo support & journey timeline
  commitmentsTitle: string; // Title for the Friendship Pact section
  commitments: CommitmentItem[]; // 1 to 12 commitments
  musicType: 'preset' | 'custom';
  presetAudioTrack?: string;
  customAudioUrl?: string;
  audioSettings: {
    autoplay: boolean;
    loop: boolean;
    volume: number;
    fadeIn: boolean;
  };
  senderSignature?: SignatureData;
  recipientSignature?: SignatureData;
  status: 'draft' | 'published' | 'signed';
  agreementNumber: string;
  location?: string;
  viewsCount: number;
  downloadsCount: number;
  shareAnalytics: ShareAnalytics;
  visitorLogs: VisitorLog[];
  certificateImageDataUrl?: string;
  agreementPdf?: string;
  agreementPng?: string;
  certificatePdf?: string;
  certificatePng?: string;
  createdAt: string;
  signedAt?: string;
}

export interface AnalyticsStats {
  totalCards?: number;
  totalCardsCreated?: number;
  totalViews: number;
  totalSignedAgreements: number;
  totalCustomAudioUploaded?: number;
  totalDownloads: number;
  themeBreakdown?: Partial<Record<ThemeId, number>>;
  shareAnalyticsBreakdown?: ShareAnalytics;
  visitorLogs?: VisitorLog[];
}
