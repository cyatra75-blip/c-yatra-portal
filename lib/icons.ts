import React from 'react';
import {
  Plane,
  Users,
  Bed,
  Car,
  Home,
  Building2,
  Bus,
  Train,
  Globe,
  ShieldCheck,
  Compass,
  MapPin,
  Luggage,
  Calendar,
  CreditCard,
  Ticket,
  Ship,
  Umbrella,
  Navigation,
  KeyRound,
  Shield,
  Smartphone,
  Sparkles,
  LucideIcon
} from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
  icon: LucideIcon;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { name: 'Plane', label: 'Flight', icon: Plane },
  { name: 'Users', label: 'Group / Fix Departure', icon: Users },
  { name: 'Bed', label: 'Hotel / Stay', icon: Bed },
  { name: 'Car', label: 'Cab / Car', icon: Car },
  { name: 'Home', label: 'Villa / Property', icon: Home },
  { name: 'Building2', label: 'Home Stay / Heritage', icon: Building2 },
  { name: 'Bus', label: 'Bus / Coach', icon: Bus },
  { name: 'Train', label: 'Train / Railway', icon: Train },
  { name: 'Globe', label: 'Visa / Global', icon: Globe },
  { name: 'ShieldCheck', label: 'Insurance / Safety', icon: ShieldCheck },
  { name: 'Compass', label: 'Tour / Adventure', icon: Compass },
  { name: 'MapPin', label: 'Destination', icon: MapPin },
  { name: 'Luggage', label: 'Baggage / Packages', icon: Luggage },
  { name: 'Calendar', label: 'Dates / Schedule', icon: Calendar },
  { name: 'Ticket', label: 'Tickets / Passes', icon: Ticket },
  { name: 'Ship', label: 'Cruise / Boat', icon: Ship },
  { name: 'Umbrella', label: 'Beach / Holiday', icon: Umbrella },
  { name: 'Navigation', label: 'Guide / Route', icon: Navigation },
  { name: 'CreditCard', label: 'Forex / Payments', icon: CreditCard },
  { name: 'Sparkles', label: 'Special / Luxury', icon: Sparkles },
];

export const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  Users,
  Bed,
  Car,
  Home,
  Building2,
  Bus,
  Train,
  Globe,
  ShieldCheck,
  Compass,
  MapPin,
  Luggage,
  Calendar,
  Ticket,
  Ship,
  Umbrella,
  Navigation,
  CreditCard,
  Sparkles,
  Shield,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Globe;
}
