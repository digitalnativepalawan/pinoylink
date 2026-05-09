import { 
  Play, 
  ShoppingBag, 
  Video, 
  Music, 
  Share2, 
  Camera, 
  MessageCircle, 
  Headphones, 
  Radio, 
  Mic, 
  Tv, 
  Bookmark, 
  Briefcase, 
  PhoneCall, 
  Send, 
  MessageSquare, 
  Hash, 
  Code, 
  ShoppingCart, 
  Tag, 
  QrCode, 
  Utensils, 
  Heart, 
  Link as LinkIcon, 
  FileText, 
  Mail, 
  MapPin, 
  Calendar 
} from 'lucide-react';

interface DynamicLucideIconProps {
  name?: string;
  className?: string;
}

export default function DynamicLucideIcon({ name = 'LinkIcon', className = "w-4 h-4" }: DynamicLucideIconProps) {
  switch (name) {
    case 'Youtube': return <Play className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Video': return <Video className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Share2': return <Share2 className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Twitter': return <Share2 className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    case 'Headphones': return <Headphones className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'Mic': return <Mic className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Bookmark': return <Bookmark className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'PhoneCall': return <PhoneCall className={className} />;
    case 'Send': return <Send className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Hash': return <Hash className={className} />;
    case 'Code': return <Code className={className} />;
    case 'ShoppingCart': return <ShoppingCart className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'QrCode': return <QrCode className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    default: return <LinkIcon className={className} />;
  }
}

export const AVAILABLE_LUCIDE_ICONS = [
  { name: 'LinkIcon', label: 'Default Link' },
  { name: 'Youtube', label: 'Video Channel' },
  { name: 'ShoppingBag', label: 'Store Drop' },
  { name: 'Music', label: 'Audio Track' },
  { name: 'Camera', label: 'Photo Feed' },
  { name: 'Video', label: 'TikTok/Clip' },
  { name: 'MessageCircle', label: 'Chat/Threads' },
  { name: 'FileText', label: 'PDF Menu' },
  { name: 'MapPin', label: 'Location Pin' },
  { name: 'Calendar', label: 'Booking Desk' }
];
