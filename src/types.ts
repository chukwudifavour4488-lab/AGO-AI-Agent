export type NigerianCity = 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano' | 'All Nigeria';

export interface Product {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano';
  locationArea: string;
  category: 'phones' | 'fashion' | 'sneakers' | 'electronics' | 'native' | 'all';
  image: string;
  gallery?: string[];
  rating: number;
  reviewsCount: number;
  condition: 'Brand New' | 'UK Used' | 'Refurbished' | 'Custom Made';
  seller: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    city: string;
    rating: number;
    responseTime: string;
  };
  description: string;
  specs?: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  inStock: boolean;
  featured?: boolean;
  sourceUrl?: string;
  scrapedAt?: string;
  scrapedVia?: 'Firecrawl' | 'Merchant' | 'AI Sync';
  firestoreId?: string;
}

export interface ToolCallExecution {
  toolName: string;
  params?: any;
  resultSummary?: string;
  statusText?: string;
}

export interface ScamAlertData {
  isScamLikely: boolean;
  riskLevel: 'high' | 'medium' | 'safe';
  warning: string;
  reasons?: string[];
  payBeforeDeliveryWarning?: boolean;
}

export interface PriceComparisonData {
  itemName: string;
  jumiaPrice: string;
  kongaPrice: string;
  facebookMarketplacePrice: string;
  agoPrice?: string;
  verdict?: string;
}

export interface EscrowDetailData {
  recommended: boolean;
  amountNaira?: number;
  steps: { stepNumber: number; title: string; description: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ago_ai' | 'seller' | 'system';
  text: string;
  timestamp: string;
  products?: Product[];
  suggestedActions?: string[];
  bargainScript?: string;
  languageDetected?: string;
  scamAlert?: ScamAlertData;
  priceComparison?: PriceComparisonData;
  escrowDetail?: EscrowDetailData;
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  createdAtMs?: number;
  toolCallsExecuted?: ToolCallExecution[];
  generatedImage?: {
    url: string;
    prompt: string;
    title?: string;
  };
  buyTriggeredProduct?: Product;
  orderConfirmation?: {
    orderNumber: string;
    productTitle: string;
    amountFormatted: string;
    deliveryAddress: string;
    gateway: 'Paystack' | 'Flutterwave';
    status: string;
  };
}

export interface DirectMessageThread {
  id: string;
  seller: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    city: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: {
    id: string;
    sender: 'user' | 'seller';
    text: string;
    timestamp: string;
    productContext?: {
      title: string;
      priceFormatted: string;
      image: string;
    };
  }[];
}

export interface FeedPost {
  id: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    city: string;
    followers: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video_mock';
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  productTagged: Product;
  audioTitle: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
}

export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  role: 'seller' | 'creator' | 'buyer' | 'admin';
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano';
  status: 'active' | 'banned' | 'pending';
  verified: boolean;
  joinedDate: string;
  totalVolumeNaira: number;
  totalVolumeFormatted: string;
  totalListingsOrPosts: number;
  rating?: number;
  banReason?: string;
  banDate?: string;
}

