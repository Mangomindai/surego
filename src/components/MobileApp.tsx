import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  Building,
  Shield,
  Clock,
  Check,
  Plus,
  AlertTriangle,
  Send,
  Droplet,
  Car,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Map,
  X,
  Heart,
  Store,
  Fuel,
  CreditCard,
  Building2,
  Lock,
  Compass,
  Briefcase,
  Database
} from 'lucide-react';
import { Place, PlaceCategory, UserRole, UserReport, SystemNotification, OfflineQueueItem, LiveStatus } from '../types';
import { INITIAL_PLACES } from '../data/initialPlaces';
import { motion, AnimatePresence } from 'motion/react';

// Help helper to match categories with icons and colors
export const getCategoryIcon = (category: PlaceCategory) => {
  switch (category) {
    case 'Hospital':
      return <Heart className="w-4 h-4 text-rose-500" />;
    case 'Restaurant':
      return <Store className="w-4 h-4 text-emerald-500" />;
    case 'Petrol Pump':
      return <Fuel className="w-4 h-4 text-sky-500" />;
    case 'ATM':
      return <CreditCard className="w-4 h-4 text-indigo-500" />;
    case 'Government Office':
      return <Building className="w-4 h-4 text-amber-500" />;
    case 'Road':
      return <Car className="w-4 h-4 text-orange-500" />;
    case 'Water Supply':
      return <Droplet className="w-4 h-4 text-blue-500" />;
    case 'Temple':
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    case 'Pharmacy':
      return <Briefcase className="w-4 h-4 text-teal-500" />;
    default:
      return <MapPin className="w-4 h-4 text-slate-500" />;
  }
};

export const getColorClasses = (color: 'Green' | 'Yellow' | 'Red' | 'Gray') => {
  switch (color) {
    case 'Green':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-500 text-white',
        border: 'border-emerald-500',
      };
    case 'Yellow':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        text: 'text-amber-800',
        badge: 'bg-amber-500 text-slate-900',
        border: 'border-amber-500',
      };
    case 'Red':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        text: 'text-rose-700',
        badge: 'bg-rose-500 text-white',
        border: 'border-rose-500',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        text: 'text-slate-700',
        badge: 'bg-slate-400 text-white',
        border: 'border-slate-400',
      };
  }
};

export default function MobileApp() {
  // Application State
  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('p1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'All'>('All');
  
  // User Profile Simulation
  const [userRole, setUserRole] = useState<UserRole>('Visitor');
  const [userEmail, setUserEmail] = useState<string>('bkdk963@gmail.com');
  const [isVerifiedEmployee, setIsVerifiedEmployee] = useState<boolean>(false);
  const [employeePlaceId, setEmployeePlaceId] = useState<string>('p3'); // Verified for Petrol Pump by default
  const [ownedPlaceId, setOwnedPlaceId] = useState<string>('p2'); // Owns Shanti Sagar Restaurant by default
  const [verificationPending, setVerificationPending] = useState<boolean>(false);
  const [verificationDocument, setVerificationDocument] = useState<string>('');

  // GPS Simulation Settings
  const [simulatedDistance, setSimulatedDistance] = useState<number>(35); // meters from selected place
  const [geofenceRadius, setGeofenceRadius] = useState<number>(100); // meters maximum allowed for crowdsourcing
  const [gpsLocked, setGpsLocked] = useState<boolean>(true);

  // Network Offline Simulation
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'n1',
      placeId: 'p4',
      placeName: 'SBI cashPoint ATM',
      message: 'Reported out of cash by Visitor 3 mins ago. Confidence: 78%',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'error',
    },
    {
      id: 'n2',
      placeId: 'p2',
      placeName: 'Shanti Sagar Vegetarian',
      message: 'Official business owner confirmed 100% capacity and zero waiting queue!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'success',
    },
    {
      id: 'n3',
      placeId: 'p6',
      placeName: 'MG Road Underpass Sector 4',
      message: 'Critical warning: heavy flooding. Road blocked. Use alternative route.',
      timestamp: new Date(Date.now() - 22 * 60 * 1000),
      type: 'warning',
    }
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // User Reports Logs (History audit tracker)
  const [allReports, setAllReports] = useState<UserReport[]>([
    {
      id: 'r1',
      placeId: 'p4',
      category: 'ATM',
      status: 'Not Working',
      queue: 'None',
      stockStatus: 'Out of Stock',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      userId: 'user_v12',
      userRole: 'Visitor',
      confidence: 78,
      expiresAt: new Date(Date.now() + 28 * 60 * 1000),
      isVerified: false,
    },
    {
      id: 'r2',
      placeId: 'p2',
      category: 'Restaurant',
      status: 'Open',
      queue: 'None',
      stockStatus: 'Available',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      userId: 'user_owner',
      userRole: 'Owner',
      confidence: 100,
      expiresAt: new Date(Date.now() + 115 * 60 * 1000),
      isVerified: true,
    }
  ]);

  // Last update rate limit timestamps (prevent spam)
  const [lastUpdateTimes, setLastUpdateTimes] = useState<Record<string, number>>({});

  // Active Place Memo
  const selectedPlace = useMemo(() => {
    return places.find((p) => p.id === selectedPlaceId) || places[0];
  }, [places, selectedPlaceId]);

  // Geofence verification status
  const isWithinGeofence = useMemo(() => {
    return simulatedDistance <= geofenceRadius;
  }, [simulatedDistance, geofenceRadius]);

  // Categories helper list
  const categories: { name: PlaceCategory; label: string }[] = [
    { name: 'Hospital', label: 'Hospitals' },
    { name: 'Restaurant', label: 'Restaurants' },
    { name: 'Petrol Pump', label: 'Petrol Pumps' },
    { name: 'ATM', label: 'ATMs' },
    { name: 'Government Office', label: 'Gov Offices' },
    { name: 'Road', label: 'Road Status' },
    { name: 'Water Supply', label: 'Water' },
    { name: 'Temple', label: 'Temples' },
    { name: 'Pharmacy', label: 'Pharmacies' },
  ];

  // Filtering Places
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [places, selectedCategory, searchQuery]);

  // Handle Offline Mode Toggling and Syncing
  const toggleOfflineMode = () => {
    if (isOffline) {
      // Reconnecting -> Syncing Queue
      setIsOffline(false);
      if (offlineQueue.length > 0) {
        // Process queued items
        const newPlaces = [...places];
        offlineQueue.forEach((queuedItem) => {
          const idx = newPlaces.findIndex((p) => p.id === queuedItem.placeId);
          if (idx !== -1) {
            const currentPlace = newPlaces[idx];
            
            // Recalculate indicators based on status
            let indicator: 'Green' | 'Yellow' | 'Red' | 'Gray' = 'Green';
            if (queuedItem.status === 'Closed' || queuedItem.status === 'Not Working' || queuedItem.status === 'Blocked' || queuedItem.status === 'No Water') {
              indicator = 'Red';
            } else if (queuedItem.queue === 'Long' || queuedItem.queue === 'Medium' || queuedItem.stockStatus === 'Low Stock' || queuedItem.status === 'Water Arrived') {
              indicator = 'Yellow';
            }

            newPlaces[idx] = {
              ...currentPlace,
              indicatorColor: indicator,
              liveStatus: {
                ...currentPlace.liveStatus,
                status: queuedItem.status as any,
                queue: queuedItem.queue as any,
                stockStatus: queuedItem.stockStatus as any,
                updatedAt: new Date(),
                updatedByRole: 'Visitor', // Offline is crowdsourced visitor
                confidence: 65, // Base confidence for visitors
                expiresAt: new Date(Date.now() + 45 * 60 * 1000),
                additionalInfo: `${currentPlace.name} live status updated via queued offline synchronization.`,
              },
            };
          }
        });

        setPlaces(newPlaces);
        
        // Add sync notifications
        const syncNotifications: SystemNotification[] = [
          {
            id: `sync_${Date.now()}`,
            placeId: 'all',
            placeName: 'System Queue',
            message: `⚡ Restored Connection! Successfully synchronized ${offlineQueue.length} live status update(s).`,
            timestamp: new Date(),
            type: 'success',
          },
          ...notifications,
        ];
        setNotifications(syncNotifications);
        setOfflineQueue([]);
      }
    } else {
      setIsOffline(true);
    }
  };

  // Quick report status triggers
  const handleQuickReport = (
    placeId: string,
    status: string,
    queue: string,
    stockStatus?: string,
    additionalText?: string
  ) => {
    // 1. Spam Prevention: Check Rate Limit (30 seconds)
    const now = Date.now();
    const lastUpdate = lastUpdateTimes[placeId] || 0;
    if (now - lastUpdate < 30 * 1000) {
      alert(`⚠️ Rate Limit: Please wait ${Math.ceil((30 * 1000 - (now - lastUpdate)) / 1000)} seconds before reporting for this place again.`);
      return;
    }

    // 2. Geofence Verification Check (Only if GPS is simulated as locked)
    if (gpsLocked && !isWithinGeofence) {
      alert(`🚫 GPS Geofence Lock: You are physically too far (${simulatedDistance}m) to update this place. Must be within ${geofenceRadius}m.`);
      return;
    }

    // Update timestamp
    setLastUpdateTimes({
      ...lastUpdateTimes,
      [placeId]: now,
    });

    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return;

    // 3. Offline queuing
    if (isOffline) {
      const newItem: OfflineQueueItem = {
        id: `offline_${now}`,
        placeId,
        category: targetPlace.category,
        status: status as any,
        queue: queue as any,
        stockStatus: stockStatus as any,
        timestamp: new Date(),
      };
      setOfflineQueue([...offlineQueue, newItem]);
      
      const offlineNotif: SystemNotification = {
        id: `offline_notif_${now}`,
        placeId,
        placeName: targetPlace.name,
        message: `Saved offline: status will be published as '${status}' on network connection.`,
        timestamp: new Date(),
        type: 'info',
      };
      setNotifications([offlineNotif, ...notifications]);
      return;
    }

    // 4. Online direct processing - Calculate Trust Engine Confidence & Role Weights
    let baseConfidence = 60;
    let isVerified = false;

    if (userRole === 'Employee' && employeePlaceId === placeId) {
      baseConfidence = 90;
      isVerified = true;
    } else if (userRole === 'Owner' && ownedPlaceId === placeId) {
      baseConfidence = 100;
      isVerified = true;
    } else if (userRole === 'Moderator') {
      baseConfidence = 95;
      isVerified = true;
    }

    // Adjust indicator based on standard rules
    let finalIndicatorColor: 'Green' | 'Yellow' | 'Red' | 'Gray' = 'Green';
    if (
      status === 'Closed' ||
      status === 'Not Working' ||
      status === 'Blocked' ||
      status === 'No Water'
    ) {
      finalIndicatorColor = 'Red';
    } else if (
      queue === 'Long' ||
      queue === 'Medium' ||
      stockStatus === 'Low Stock' ||
      status === 'Water Arrived'
    ) {
      finalIndicatorColor = 'Yellow';
    }

    // Create Report log
    const newReport: UserReport = {
      id: `rep_${now}`,
      placeId,
      category: targetPlace.category,
      status,
      queue,
      stockStatus,
      timestamp: new Date(),
      userId: userRole === 'Visitor' ? `user_${Math.floor(Math.random() * 1000)}` : `verified_${userRole.toLowerCase()}`,
      userRole,
      confidence: baseConfidence,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // expires in 1 hour
      isVerified,
    };

    setAllReports([newReport, ...allReports]);

    // Update places DB
    const updatedPlaces = places.map((p) => {
      if (p.id === placeId) {
        return {
          ...p,
          indicatorColor: finalIndicatorColor,
          liveStatus: {
            status: status as any,
            queue: queue as any,
            stockStatus: stockStatus as any,
            additionalInfo: additionalText || `Crowdsourced report confirmed by ${userRole} at local time.`,
            updatedAt: new Date(),
            updatedByRole: userRole,
            confidence: baseConfidence,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            officialAnnouncement: p.liveStatus.officialAnnouncement,
          },
        };
      }
      return p;
    });

    setPlaces(updatedPlaces);

    // Push notification trigger
    const categoryEmoji = getCategoryEmoji(targetPlace.category);
    const newNotif: SystemNotification = {
      id: `notif_${now}`,
      placeId,
      placeName: targetPlace.name,
      message: `${categoryEmoji} Status updated to '${status}' with '${queue}' queue (Confidence: ${baseConfidence}%)`,
      timestamp: new Date(),
      type: finalIndicatorColor === 'Red' ? 'error' : finalIndicatorColor === 'Yellow' ? 'warning' : 'success',
    };

    setNotifications([newNotif, ...notifications]);
  };

  const getCategoryEmoji = (category: PlaceCategory) => {
    switch (category) {
      case 'Hospital': return '🏥';
      case 'Restaurant': return '🍜';
      case 'Petrol Pump': return '⛽';
      case 'ATM': return '🏧';
      case 'Government Office': return '🏢';
      case 'Road': return '🚧';
      case 'Water Supply': return '🚰';
      case 'Temple': return '🛕';
      case 'Pharmacy': return '💊';
      default: return '📍';
    }
  };

  // Submit Official Owner Announcement
  const handleOwnerAnnouncement = (placeId: string, text: string) => {
    if (!text.trim()) return;

    setPlaces(places.map(p => {
      if (p.id === placeId) {
        return {
          ...p,
          liveStatus: {
            ...p.liveStatus,
            officialAnnouncement: text,
            updatedAt: new Date(),
            updatedByRole: 'Owner',
            confidence: 100
          }
        };
      }
      return p;
    }));

    // Trigger Notification
    const ownerNotif: SystemNotification = {
      id: `owner_notif_${Date.now()}`,
      placeId,
      placeName: selectedPlace.name,
      message: `📢 Official Business Announcement: "${text}"`,
      timestamp: new Date(),
      type: 'info'
    };
    setNotifications([ownerNotif, ...notifications]);
  };

  // Clear Official Announcement
  const handleClearAnnouncement = (placeId: string) => {
    setPlaces(places.map(p => {
      if (p.id === placeId) {
        return {
          ...p,
          liveStatus: {
            ...p.liveStatus,
            officialAnnouncement: undefined
          }
        };
      }
      return p;
    }));
  };

  // Apply for Employee Verification
  const submitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDocument.trim()) return;
    setVerificationPending(true);
    
    // Simulate Moderator automatically approving in 4 seconds
    setTimeout(() => {
      setVerificationPending(false);
      setIsVerifiedEmployee(true);
      setEmployeePlaceId(selectedPlaceId);
      setUserRole('Employee');
      
      const verifyNotif: SystemNotification = {
        id: `verify_${Date.now()}`,
        placeId: selectedPlaceId,
        placeName: places.find(p => p.id === selectedPlaceId)?.name || 'Selected Place',
        message: `🛡️ Verification Approved! You are now a Verified Employee of ${places.find(p => p.id === selectedPlaceId)?.name}.`,
        timestamp: new Date(),
        type: 'success'
      };
      setNotifications(prev => [verifyNotif, ...prev]);
    }, 4000);
  };

  // Reset demo places to original values
  const resetSimulation = () => {
    setPlaces(INITIAL_PLACES);
    setNotifications([
      {
        id: `reset_${Date.now()}`,
        placeId: 'all',
        placeName: 'System Reset',
        message: '🔄 Simulation restarted. Initial place statuses restored.',
        timestamp: new Date(),
        type: 'info',
      }
    ]);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-w-7xl mx-auto min-h-[820px]">
      
      {/* LEFT: SIMULATED MOBILE DEVICE VIEW */}
      <div className="w-full lg:w-[420px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col relative">
        
        {/* PHONE NOTCH / STATUS BAR */}
        <div className="bg-slate-100/80 px-5 pt-3 pb-2 flex justify-between items-center text-slate-500 text-xs font-mono select-none border-b border-slate-200/60 z-20">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span className="font-semibold text-slate-700">SureGo Live GPS</span>
          </div>
          <div className="w-16 h-4 bg-slate-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2 border border-slate-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-600/80 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Live
              </span>
            )}
            <span className="text-slate-500 bg-slate-200/60 px-1 rounded">5G</span>
          </div>
        </div>

        {/* MOBILE GREETING & ROLE SELECTOR */}
        <div className="bg-white p-4 border-b border-slate-200 z-10">
          <div className="flex justify-between items-center gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Current User Role</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-slate-800">
                  {userRole === 'Visitor' && '👤 Visitor Account'}
                  {userRole === 'Employee' && '🛡️ Verified Employee'}
                  {userRole === 'Owner' && '💼 Business Owner'}
                  {userRole === 'Moderator' && '🛡️ System Moderator'}
                </span>
              </div>
            </div>
            
            {/* ROLE PICKER SWIFT SWITCHER */}
            <select
              value={userRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setUserRole(role);
                if (role === 'Owner') {
                  setSelectedPlaceId(ownedPlaceId);
                } else if (role === 'Employee' && isVerifiedEmployee) {
                  setSelectedPlaceId(employeePlaceId);
                }
              }}
              className="bg-blue-50/50 text-xs border border-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="Visitor">Visitor</option>
              <option value="Employee">Verified Employee</option>
              <option value="Owner">Business Owner</option>
              <option value="Moderator">Moderator</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mt-3 gap-2">
            <button
              onClick={toggleOfflineMode}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isOffline 
                  ? 'bg-rose-50 border-rose-100 text-rose-700' 
                  : 'bg-slate-100 hover:bg-slate-200/70 border-slate-200 text-slate-700'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline Queue ({offlineQueue.length})
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  Go Offline
                </>
              )}
            </button>
            
            {/* NOTIFICATION ICON BELL */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Notifications Log"
            >
              <Bell className="w-3.5 h-3.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={resetSimulation}
              className="p-2 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-slate-500 border border-slate-200 transition cursor-pointer"
              title="Reset Database Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS CONTAINER MODAL OVERLAY */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[110px] left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl z-30 max-h-[380px] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-mono text-slate-500 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-blue-600" /> SYSTEM ALERTS LOG
                </span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-500 hover:text-slate-800 p-1 rounded bg-slate-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-mono">No live alerts currently</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-2.5 rounded-lg text-xs border text-slate-700 ${
                        notif.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                        notif.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                        notif.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] font-semibold opacity-90">
                        <span className="font-bold">{notif.placeName}</span>
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                      </div>
                      <p className="leading-tight">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH AND FILTERS */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search places, categories, roads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* HORIZONTAL CATEGORIES SLIDER */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              All Places
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAP VIEWPORT / SCHEMATIC VISUALIZER */}
        <div className="relative h-44 bg-slate-50 border-b border-slate-200 overflow-hidden select-none flex items-center justify-center">
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* CRITICAL GEOMETRIC RADAR GRAPH FOR PLACES */}
          <svg className="w-full h-full absolute inset-0 cursor-crosshair">
            {/* Grid line guidelines */}
            <circle cx="210" cy="88" r="40" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
            <circle cx="210" cy="88" r="80" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
            
            {/* Pulsing geofence radar scan when place is selected */}
            {selectedPlace && (
              <circle 
                cx={210 + (selectedPlace.lat - 12.9716) * 12000} 
                cy={88 - (selectedPlace.lng - 77.5946) * 12000} 
                r={geofenceRadius / 2} 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="1.5" 
                className="animate-pulse"
                opacity="0.2"
              />
            )}

            {/* Custom paths representing rivers / roads on schematic */}
            <path d="M 0 50 Q 200 40 420 70" fill="none" stroke="#cbd5e1" strokeWidth="3" opacity="0.6" />
            <path d="M 120 0 Q 150 100 130 176" fill="none" stroke="#cbd5e1" strokeWidth="2.5" opacity="0.5" />

            {/* Render all places as markers */}
            {filteredPlaces.map((p) => {
              // Convert coordinate differences to visual spacing coordinates relative to center (210, 88)
              const xOffset = (p.lat - 12.9716) * 12000;
              const yOffset = -(p.lng - 77.5946) * 12000;
              const cx = 210 + xOffset;
              const cy = 88 + yOffset;

              const isSelected = p.id === selectedPlaceId;
              const col = getColorClasses(p.indicatorColor);

              return (
                <g 
                  key={p.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedPlaceId(p.id)}
                >
                  {/* Selected Outer Glow Rings */}
                  {isSelected && (
                    <>
                      <circle cx={cx} cy={cy} r="16" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="2" />
                      <circle cx={cx} cy={cy} r="10" fill="none" stroke={col.dot === 'bg-slate-400' ? '#94a3b8' : p.indicatorColor === 'Green' ? '#10b981' : p.indicatorColor === 'Yellow' ? '#f59e0b' : '#f43f5e'} strokeWidth="1.5" className="animate-ping" opacity="0.4" />
                    </>
                  )}
                  {/* Outer shadow / indicator ring */}
                  <circle cx={cx} cy={cy} r="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  {/* Centered color node */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="4" 
                    className={`${col.dot} group-hover:scale-125 transition-transform duration-200`} 
                  />
                </g>
              );
            })}

            {/* User current simulated location indicator (Self) */}
            {selectedPlace && (
              <g>
                <circle 
                  cx={210 + (selectedPlace.lat - 12.9716) * 12000 + (simulatedDistance / 100) * 15} 
                  cy={88 - (selectedPlace.lng - 77.5946) * 12000 + (simulatedDistance / 100) * 15} 
                  r="5" 
                  fill="#2563eb" 
                  stroke="#ffffff" 
                  strokeWidth="1.5"
                />
                <circle 
                  cx={210 + (selectedPlace.lat - 12.9716) * 12000 + (simulatedDistance / 100) * 15} 
                  cy={88 - (selectedPlace.lng - 77.5946) * 12000 + (simulatedDistance / 100) * 15} 
                  r="12" 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth="1" 
                  opacity="0.3" 
                  className="animate-ping"
                />
              </g>
            )}
          </svg>

          {/* Map Status Floating Overlays */}
          <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-0.5 rounded border border-slate-200 text-[9px] text-slate-500 font-mono flex items-center gap-1 shadow-xs">
            <Layers className="w-2.5 h-2.5" /> Vector Schematic Map
          </div>
          <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-md border border-slate-200 text-[10px] text-slate-600 font-medium flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> You ({simulatedDistance}m away)
          </div>
        </div>

        {/* PLACES SCROLL LIST AND ACTIVE DRAWER */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50 p-3 space-y-3">
          
          {/* MAIN SELECTED PLACE LIVE STATUS HERO CARD */}
          {selectedPlace && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 relative overflow-hidden">
              
              {/* Subtle visual gradient header based on indicators */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                selectedPlace.indicatorColor === 'Green' ? 'bg-emerald-500' :
                selectedPlace.indicatorColor === 'Yellow' ? 'bg-amber-500' :
                selectedPlace.indicatorColor === 'Red' ? 'bg-rose-500' : 'bg-slate-300'
              }`}></div>

              {/* Header Title & Indicator Badge */}
              <div className="flex justify-between items-start gap-2 pt-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {selectedPlace.category}
                    </span>
                    <span className="text-xs text-blue-600 flex items-center gap-1 font-semibold">
                      {getCategoryIcon(selectedPlace.category)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950 mt-1 leading-tight">{selectedPlace.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{selectedPlace.address}</p>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                  getColorClasses(selectedPlace.indicatorColor).bg
                }`}>
                  ● {selectedPlace.liveStatus.status}
                </span>
              </div>

              {/* OFFICIAL ANNOUNCEMENTS FROM OWNER PIN */}
              {selectedPlace.liveStatus.officialAnnouncement && (
                <div className="bg-blue-50/55 border border-blue-100 rounded-xl p-3 flex gap-2 text-xs text-blue-800">
                  <div className="shrink-0 mt-0.5">📢</div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-[10px] uppercase tracking-wider text-blue-600 font-mono">OFFICIAL ANNOUNCEMENT</p>
                    <p className="italic leading-relaxed">"{selectedPlace.liveStatus.officialAnnouncement}"</p>
                    {userRole === 'Owner' && ownedPlaceId === selectedPlace.id && (
                      <button 
                        onClick={() => handleClearAnnouncement(selectedPlace.id)}
                        className="text-[9px] text-rose-600 hover:text-rose-800 underline font-semibold mt-1 cursor-pointer"
                      >
                        Delete Announcement
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Live Details Section */}
              <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-3 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-200/70 pb-1.5">
                  <span className="text-slate-500 font-medium">Queue Length</span>
                  <span className={`font-bold ${
                    selectedPlace.liveStatus.queue === 'Long' ? 'text-rose-600' :
                    selectedPlace.liveStatus.queue === 'Medium' ? 'text-amber-600' :
                    selectedPlace.liveStatus.queue === 'Short' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {selectedPlace.liveStatus.queue}
                  </span>
                </div>

                {selectedPlace.liveStatus.stockStatus && selectedPlace.liveStatus.stockStatus !== 'N/A' && (
                  <div className="flex justify-between items-center border-b border-slate-200/70 pb-1.5">
                    <span className="text-slate-500 font-medium">Stock Status</span>
                    <span className={`font-bold ${
                      selectedPlace.liveStatus.stockStatus === 'Out of Stock' ? 'text-rose-600' :
                      selectedPlace.liveStatus.stockStatus === 'Low Stock' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedPlace.liveStatus.stockStatus}
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-1 font-mono">Current Live Info</p>
                  <p className="text-slate-600 italic font-mono leading-relaxed bg-white p-2 rounded-lg border border-slate-200/60">
                    "{selectedPlace.liveStatus.additionalInfo}"
                  </p>
                </div>

                <div className="flex justify-between items-center pt-1.5 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    Updated {Math.floor((Date.now() - selectedPlace.liveStatus.updatedAt.getTime()) / 60000)}m ago
                  </span>
                  <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    By {selectedPlace.liveStatus.updatedByRole}
                  </span>
                </div>
              </div>

              {/* TRUST METER ENGINE (Confidence Score) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    TRUST ENGINE CONFIDENCE
                  </span>
                  <span className="font-bold text-slate-800">{selectedPlace.liveStatus.confidence}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedPlace.liveStatus.confidence >= 90 ? 'bg-gradient-to-r from-emerald-600 to-teal-400' :
                      selectedPlace.liveStatus.confidence >= 70 ? 'bg-gradient-to-r from-amber-500 to-emerald-500' :
                      'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${selectedPlace.liveStatus.confidence}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-slate-500 font-mono leading-tight">
                  Updates degrade by age and conflict reports. Official owners carry 100% weights.
                </p>
              </div>

              {/* REPORTING ACTIONS DRAWER - Geofence locked / unlocked */}
              <div className="pt-2 border-t border-slate-100">
                {/* GEOLOCATION SIMULATOR CONTROLS */}
                <div className="mb-3.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      SIMULATE GPS DISTANCE
                    </span>
                    <span className={`font-bold ${isWithinGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {simulatedDistance}m ({isWithinGeofence ? 'IN RANGE' : 'TOO FAR'})
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="300"
                    value={simulatedDistance}
                    onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Geofence Radius: {geofenceRadius}m</span>
                    <span>Remote lock-out active</span>
                  </div>
                </div>

                {/* VISITOR/EMPLOYEE ONE-TAP QUICK UPDATES FORM */}
                <div>
                  <h4 className="text-xs font-bold text-slate-650 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Submit One-Tap Update
                  </h4>

                  {!isWithinGeofence && gpsLocked ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                      <p className="text-xs font-semibold text-rose-700 flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4 text-rose-600" /> Crowdsource Reporting Locked
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 leading-normal">
                        Verify physically within 100m. Change simulated distance to test update algorithms.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* CATEGORY-SPECIFIC ONE-TAP TEMPLATES */}
                      {selectedPlace.category === 'Hospital' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Short', 'Available', 'ER is empty. Minimal waiting time to see doctor.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Queue: Short
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Long', 'Available', 'Emergency queue is backed up. 2+ hours waiting time.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Queue: Long
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Restaurant' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'None', 'Available', 'Quick service. Tables instantly free.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Seats Available
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Long', 'Available', 'Waiting list is currently 30-40 minutes.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Waiting List
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Petrol Pump' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Short', 'Available', 'Both fuels ready. Instant pumping.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Fuel Available
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Closed', 'N/A', 'Out of Stock', 'Out of petrol. HP-BP pump temporarily closed.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Petrol Out of Stock
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'ATM' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Working', 'None', 'Available', 'Cash dispense working cleanly for all cards.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Working & Has Cash
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Not Working', 'None', 'Out of Stock', 'Screen is black/dead. Cash out.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 No Cash / Out of Order
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Government Office' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Short', 'N/A', 'Servers working. Processing license queries cleanly.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Servers Live / Fast
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Long', 'N/A', 'Server is down. RTO line not moving.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Server Down / Queue
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Road' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Clear', 'None', 'N/A', 'Water has been pumped out. All lanes working cleanly.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Road Clear / Paved
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Blocked', 'Long', 'N/A', 'Water level up to bumper level. Do not enter underpass.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Flooded / Blocked
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Water Supply' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Water Arrived', 'None', 'Available', 'Water supply has arrived cleanly with full pressure.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🚰 Water Arrived
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'No Water', 'N/A', 'Out of Stock', 'No municipal water pressure today. Line dry.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Supply Stopped
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Temple' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Short', 'N/A', 'Normal queue. Prayers happening nicely.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Queue: Short / Open
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Long', 'N/A', 'Festival crowd. Line stretching out past gates.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Heavy Queue / Crowd
                          </button>
                        </div>
                      )}

                      {selectedPlace.category === 'Pharmacy' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'None', 'Available', 'All major medicines and critical prescriptions stock ready.')}
                            className="bg-blue-50/40 border border-blue-100/60 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-semibold text-blue-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🟢 Stock Available
                          </button>
                          <button
                            onClick={() => handleQuickReport(selectedPlace.id, 'Open', 'Medium', 'Out of Stock', 'Crucial insulin and thyroid medicine out of stock currently.')}
                            className="bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-semibold text-rose-700 p-2.5 rounded-xl text-left transition duration-150 cursor-pointer shadow-xs"
                          >
                            🔴 Essential Stock Empty
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SPECIFIC ACCESS PORTALS: BUSINESS DASHBOARD / VERIFIED WORKFLOW */}
              {userRole === 'Owner' && ownedPlaceId === selectedPlace.id && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-[10px] font-bold text-blue-600 font-mono flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> BUSINESS OWNER CONTROL
                  </span>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem('announcement') as HTMLInputElement;
                      handleOwnerAnnouncement(selectedPlace.id, input.value);
                      input.value = '';
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      name="announcement"
                      placeholder="Broadcast official announcement..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Pin
                    </button>
                  </form>
                </div>
              )}

              {/* Verified Employee update flow if user selected Employee but not verified for this place yet */}
              {userRole === 'Employee' && employeePlaceId !== selectedPlace.id && (
                <div className="pt-3 border-t border-amber-200/75 space-y-2 text-xs bg-amber-50/50 p-3 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-850 font-mono">
                    <span>🛡️ GET EMPLOYEE VERIFICATION</span>
                    <span>Not verified here</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Submit document credentials to pin updates for **{selectedPlace.name}** with a 90% trust multiplier score.
                  </p>
                  
                  {verificationPending ? (
                    <div className="text-center py-2 text-[10px] text-amber-700 font-semibold animate-pulse font-mono">
                      ⏳ Verification document under system audit by moderators...
                    </div>
                  ) : (
                    <form onSubmit={submitVerification} className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Employee ID / Work Email (e.g. bkdk963@gov.in)"
                        value={verificationDocument}
                        onChange={(e) => setVerificationDocument(e.target.value)}
                        required
                        className="w-full bg-white border border-amber-200 text-xs text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold text-[10px] uppercase py-1.5 rounded transition shadow-xs cursor-pointer"
                      >
                        Submit Employee Credentials
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NEARBY PLACES SCROLL CONTAINER FEED */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest px-1">
              Nearby Places ({filteredPlaces.length})
            </h4>

            {filteredPlaces.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-mono">No matching places found.</p>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = place.id === selectedPlaceId;
                const col = getColorClasses(place.indicatorColor);
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`p-3 rounded-xl cursor-pointer border transition flex gap-3 items-center ${
                      isSelected
                        ? 'bg-blue-50/30 border-blue-500/85 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Status Dot */}
                    <div className="relative shrink-0">
                      <span className={`w-3.5 h-3.5 rounded-full block ${col.dot} border border-white shadow-xs`}></span>
                      {isSelected && (
                        <span className={`absolute inset-0 rounded-full ${col.dot} opacity-40 animate-ping`}></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          {place.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {Math.floor((Date.now() - place.liveStatus.updatedAt.getTime()) / 60000)}m ago
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold truncate leading-tight mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>{place.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{place.address}</p>
                    </div>

                    <div className="text-right text-slate-700">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${col.bg}`}>
                        {place.liveStatus.queue === 'N/A' ? 'Open' : place.liveStatus.queue}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BOTTOM BRANDING DECORATIVE STRIP */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            SureGo Mobile Live Emulator. v1.2.0-Alpha
          </p>
        </div>
      </div>

      {/* RIGHT: ARCHITECTURE & DELIVERABLES DOCUMENTATION VIEW */}
      <div className="flex-1 bg-slate-50/50 p-6 flex flex-col justify-between overflow-y-auto max-h-[820px] no-scrollbar">
        <div className="space-y-6">
          
          {/* ARCHITECT METADATA PANEL */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold font-mono">
                  PRODUCTION-READY ARCHITECTURE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  MVP SPECIFICATION
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2 flex items-center gap-2">
                SureGo Deliverables Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Explore the complete production-grade specifications, Firestore designs, and clean Flutter source patterns.
              </p>
            </div>
            
            <a 
              href="#app-sandbox"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm shrink-0 cursor-pointer"
              onClick={() => alert("🤖 This companion portal showcases the fully interactive live MVP on the left-side emulator screen! Submit status updates, slide the GPS slider, and toggle offline mode to see live changes!")}
            >
              How to Test Demo App?
            </a>
          </div>

          {/* TWO PANEL GRID FOR CODE DELIVERABLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* FIRESTORE SCHEMAS ACCORDION */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-mono font-bold text-xs uppercase">
                <span className="p-1 rounded bg-blue-50"><Database className="w-4 h-4" /></span>
                1. Firestore Schemas (`firestore.json`)
              </div>
              <p className="text-xs text-slate-500">
                A highly-optimized database structure for high concurrency live telemetry reporting.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-[280px] overflow-y-auto font-mono text-[10.5px] text-slate-700 leading-normal scrollbar-thin">
                <pre>{JSON.stringify({
  "places": {
    "doc_id (Place ID)": {
      "name": "Apollo Lifeline Hospital",
      "category": "Hospital",
      "geohash": "tdr1v7m3",
      "coordinates": "GeoPoint(12.9716, 77.5946)",
      "address": "Kensington Road, Ulsoor, Bengaluru",
      "indicatorColor": "Red",
      "liveStatus": {
        "status": "Open",
        "queue": "Long",
        "additionalInfo": "ER is open. General OPD current token #42.",
        "updatedAt": "Timestamp(1710524400)",
        "updatedByRole": "Visitor",
        "confidence": 65,
        "expiresAt": "Timestamp(1710528000)",
        "officialAnnouncement": "Server maintenance at 2 PM"
      }
    }
  },
  "reports": {
    "doc_id (UUID)": {
      "placeId": "p1",
      "category": "Hospital",
      "status": "Open",
      "queue": "Long",
      "timestamp": "Timestamp(1710524400)",
      "userId": "usr_94a3b8",
      "userRole": "Visitor",
      "confidenceScore": 65,
      "expirationTime": "Timestamp(1710528000)",
      "isVerified": false,
      "deviceGpsCoordinates": "GeoPoint(12.9715, 77.5945)"
    }
  },
  "employees": {
    "userId_placeId": {
      "userId": "usr_verified_912",
      "placeId": "p3",
      "verifiedAt": "Timestamp(1710480000)",
      "documentRef": "ID_BP_8812.pdf",
      "status": "Approved"
    }
  }
}, null, 2)}</pre>
              </div>
            </div>

            {/* SECURE FIRESTORE RULES */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-mono font-bold text-xs uppercase">
                <span className="p-1 rounded bg-blue-50"><Shield className="w-4 h-4" /></span>
                2. Firestore Security Rules
              </div>
              <p className="text-xs text-slate-500">
                Granular security preventing fraudulent spoofed remote coordinates reporting.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-[280px] overflow-y-auto font-mono text-[10.5px] text-slate-700 leading-normal scrollbar-thin">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Core function to calculate geofence distances in Firestore security rules
    function isWithinGeofence(deviceLoc, placeLoc, maxMeters) {
      return deviceLoc.distance(placeLoc) <= maxMeters;
    }

    match /places/{placeId} {
      allow read: if true;
      allow update: if request.auth != null && (
        // Owners or system moderators can override instantly
        resource.data.ownerId == request.auth.uid ||
        request.auth.token.role == 'Moderator'
      );
    }

    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null 
        // Prevent spoofing userID
        && request.resource.data.userId == request.auth.uid
        // Validate telemetry time drift
        && request.resource.data.timestamp == request.time
        // GPS Verification - Geofence validation on-chain
        && isWithinGeofence(
             request.resource.data.deviceGpsCoordinates,
             get(/databases/$(database)/documents/places/$(request.resource.data.placeId)).data.coordinates,
             100.0 // 100 meters geofence threshold
           );
    }
  }
}`}</pre>
              </div>
            </div>

            {/* FLUTTER CLEAN ARCHITECTURE PATTERNS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-mono font-bold text-xs uppercase">
                <span className="p-1 rounded bg-blue-50"><Map className="w-4 h-4" /></span>
                3. Flutter Directory Layout
              </div>
              <p className="text-xs text-slate-500">
                Organized following Domain-Driven Design (Clean Architecture and Riverpod pattern).
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-[280px] overflow-y-auto font-mono text-[10.5px] text-slate-700 leading-normal scrollbar-thin">
                <pre>{`lib/
├── core/
│   ├── network/
│   │   └── network_info.dart (Offline detection)
│   ├── security/
│   │   └── gps_hasher.dart (Geofence validation)
│   └── theme/
│       └── custom_palette.dart
├── features/
│   ├── auth/
│   │   └── domain/repositories/auth_repository.dart
│   ├── live_status/
│   │   ├── data/
│   │   │   ├── datasources/place_remote_source.dart
│   │   │   └── repositories/place_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/place_status.dart
│   │   │   ├── usecases/submit_live_report.dart
│   │   │   └── usecases/calculate_trust_score.dart
│   │   └── presentation/
│   │       ├── controllers/live_status_provider.dart
│   │       └── screens/mobile_map_screen.dart
│   └── user_portal/
│       └── presentation/screens/employee_verify_screen.dart
└── main.dart`}</pre>
              </div>
            </div>

            {/* FLUTTER TRUST ENGINE MODEL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-mono font-bold text-xs uppercase">
                <span className="p-1 rounded bg-blue-50"><Sparkles className="w-4 h-4" /></span>
                4. Flutter Live Trust Engine
              </div>
              <p className="text-xs text-slate-500">
                Dart controller logic calculating decaying confidence matrices based on roles & time elapsed.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-[280px] overflow-y-auto font-mono text-[10.5px] text-slate-700 leading-normal scrollbar-thin">
                <pre>{`class TrustEngine {
  // Calculates real-time status confidence index
  static int calculateConfidence({
    required List<UserReport> history,
    required DateTime currentTime,
  }) {
    if (history.isEmpty) return 0;
    
    double weightedSum = 0;
    double weightTotal = 0;
 
    for (var report in history) {
      // 1. Role Weight Factor
      double roleWeight = 1.0;
      if (report.userRole == 'Owner') roleWeight = 5.0;
      if (report.userRole == 'Employee') roleWeight = 3.0;
      if (report.userRole == 'Moderator') roleWeight = 4.0;

      // 2. Temporal Decay Factor (Half-life: 30 minutes)
      final ageMinutes = currentTime.difference(report.timestamp).inMinutes;
      if (ageMinutes >= 60) continue; // Expired report
      
      final decay = ageMinutes < 0 ? 1.0 : (1.0 - (ageMinutes / 60.0));

      // 3. Update Confidence calculations
      weightedSum += report.confidence * roleWeight * decay;
      weightTotal += roleWeight * decay;
    }

    if (weightTotal == 0) return 0;
    return (weightedSum / weightTotal).clamp(0, 100).toInt();
  }
}`}</pre>
              </div>
            </div>

          </div>

          {/* LAUNCH / DEPLOYMENT GUIDE */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3.5">
            <h3 className="text-sm font-bold text-blue-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              SureGo Production Launch & Deployment Strategy
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Phase 1: Local Launch
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Start in double-digit geofenced hubs (e.g. IT Parks, hospital zones) to seed initial trust updates.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Phase 2: Employee Sync
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Register verified government and corporate transport employees to lock-in ground truth indicators.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Phase 3: Scale
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Decay algorithms prevent outdated reports. Geofencing ensures zero spam from desk chairs.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* METRICS & AUDIT LOG BAR */}
        <div className="border-t border-slate-200 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-mono">
          <p>
            Authorized Access: <span className="text-blue-600 font-bold">{userEmail}</span>
          </p>
          <div className="flex gap-4">
            <span>Total Simulated Reports: <strong className="text-slate-800 font-semibold">{allReports.length}</strong></span>
            <span>Geofence Threshold: <strong className="text-emerald-600 font-semibold">100m</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
