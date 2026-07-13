export type UserRole = 'Visitor' | 'Employee' | 'Owner' | 'Moderator';

export type PlaceCategory =
  | 'Hospital'
  | 'Restaurant'
  | 'Petrol Pump'
  | 'ATM'
  | 'Government Office'
  | 'Road'
  | 'Water Supply'
  | 'Temple'
  | 'Pharmacy';

export interface LiveStatus {
  status: 'Open' | 'Closed' | 'Working' | 'Not Working' | 'Blocked' | 'Clear' | 'Water Arrived' | 'No Water';
  queue: 'None' | 'Short' | 'Medium' | 'Long' | 'N/A';
  additionalInfo?: string;
  updatedAt: Date;
  updatedByRole: UserRole;
  confidence: number; // 0 to 100
  expiresAt: Date;
  officialAnnouncement?: string;
  stockStatus?: 'Available' | 'Low Stock' | 'Out of Stock' | 'N/A';
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string;
  indicatorColor: 'Green' | 'Yellow' | 'Red' | 'Gray';
  liveStatus: LiveStatus;
}

export interface UserReport {
  id: string;
  placeId: string;
  category: PlaceCategory;
  status: string;
  queue: string;
  stockStatus?: string;
  timestamp: Date;
  userId: string;
  userRole: UserRole;
  confidence: number;
  expiresAt: Date;
  isVerified: boolean;
}

export interface SystemNotification {
  id: string;
  placeId: string;
  placeName: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface OfflineQueueItem {
  id: string;
  placeId: string;
  category: PlaceCategory;
  status: string;
  queue: string;
  stockStatus?: string;
  timestamp: Date;
}
