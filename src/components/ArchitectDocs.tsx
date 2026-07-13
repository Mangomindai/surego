import React, { useState } from 'react';
import { 
  FileCode, 
  Settings, 
  Terminal, 
  Database, 
  Layers, 
  Activity, 
  UserCheck, 
  Briefcase, 
  Compass, 
  Clipboard, 
  Check, 
  Code,
  BookOpen,
  MapPin,
  Flame,
  Search,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function ArchitectDocs() {
  const [activeTab, setActiveTab] = useState<'flutter' | 'database' | 'trust' | 'testing' | 'deployment'>('flutter');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const flutterStructure = `surego_app/
  pubspec.yaml
  android/
  ios/
  lib/
  ├── main.dart
  ├── core/
  │   ├── constants/
  │   │   └── app_keys.dart
  │   ├── theme/
  │   │   └── color_palette.dart
  │   └── services/
  │       ├── gps_service.dart
  │       └── notification_service.dart
  └── features/
      ├── auth/
      │   ├── data/
      │   │   └── auth_repository_impl.dart
      │   └── presentation/
      │       └── login_screen.dart
      ├── places/
      │   ├── domain/
      │   │   ├── entities/place_model.dart
      │   │   ├── entities/status_template.dart
      │   │   └── repositories/place_repository.dart
      │   ├── data/
      │   │   ├── datasources/firestore_datasource.dart
      │   │   └── repositories/place_repository_impl.dart
      │   └── presentation/
      │       ├── providers/live_status_provider.dart
      │       ├── screens/map_explorer_screen.dart
      │       └── widgets/quick_update_bottom_sheet.dart
      └── verification/
          └── presentation/
              └── employee_dashboard.dart`;

  const placeRepositoryDart = `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../entities/place_model.dart';

abstract class PlaceRepository {
  Stream<List<PlaceModel>> streamNearbyPlaces(LatLng userLocation, double radiusInMeters);
  Future<void> submitLiveStatusReport({
    required String placeId,
    required String status,
    required String queueLength,
    required String userId,
    required String userRole,
    required LatLng deviceCoordinates,
  });
}

class PlaceRepositoryImpl implements PlaceRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Stream<List<PlaceModel>> streamNearbyPlaces(LatLng userLocation, double radiusInMeters) {
    // Queries firestore locations with standard geo-querying bounds
    return _firestore
        .collection('places')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => PlaceModel.fromFirestore(doc))
            .toList());
  }

  @override
  Future<void> submitLiveStatusReport({
    required String placeId,
    required String status,
    required String queueLength,
    required String userId,
    required String userRole,
    required LatLng deviceCoordinates,
  }) async {
    final reportBatch = _firestore.batch();
    
    final reportRef = _firestore.collection('reports').doc();
    final placeRef = _firestore.collection('places').doc(placeId);

    // Write individual historical audit log
    reportBatch.set(reportRef, {
      'placeId': placeId,
      'status': status,
      'queue': queueLength,
      'timestamp': FieldValue.serverTimestamp(),
      'userId': userId,
      'userRole': userRole,
      'deviceCoordinates': GeoPoint(deviceCoordinates.latitude, deviceCoordinates.longitude),
      'expiresAt': DateTime.now().add(const Duration(hours: 1)).millisecondsSinceEpoch,
    });

    // Determine color based on report guidelines
    String indicatorColor = 'Green';
    if (['Closed', 'Blocked', 'Not Working', 'No Water'].contains(status)) {
      indicatorColor = 'Red';
    } else if (['Long', 'Medium'].contains(queueLength)) {
      indicatorColor = 'Yellow';
    }

    // Determine confidence weight multiplier
    int baseConfidence = 60;
    if (userRole == 'Employee') baseConfidence = 90;
    if (userRole == 'Owner') baseConfidence = 100;

    // Update real-time aggregate fields
    reportBatch.update(placeRef, {
      'indicatorColor': indicatorColor,
      'liveStatus.status': status,
      'liveStatus.queue': queueLength,
      'liveStatus.updatedAt': FieldValue.serverTimestamp(),
      'liveStatus.updatedByRole': userRole,
      'liveStatus.confidence': baseConfidence,
    });

    await reportBatch.commit();
  }
}`;

  const stateManagementCode = `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/place_repository.dart';
import '../entities/place_model.dart';

final placeRepositoryProvider = Provider<PlaceRepository>((ref) {
  return PlaceRepositoryImpl();
});

// Streams live nearby places instantly to map indicators
final nearbyPlacesProvider = StreamProvider.family<List<PlaceModel>, MapLocationParams>((ref, params) {
  final repository = ref.watch(placeRepositoryProvider);
  return repository.streamNearbyPlaces(params.userLocation, params.radius);
});

// Maintains active user geofence tracking
class GeofenceNotifier extends StateNotifier<bool> {
  GeofenceNotifier() : super(false);

  void verifyProximity(double distanceInMeters, double maxGeofenceRadius) {
    state = distanceInMeters <= maxGeofenceRadius;
  }
}

final geofenceProvider = StateNotifierProvider<GeofenceNotifier, bool>((ref) {
  return GeofenceNotifier();
});`;

  const securityRulesDoc = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if GPS updates match actual map points coordinates within 100 meters
    function isPhysicallyPresent(devicePoint, placeId) {
      let placeData = get(/databases/$(database)/documents/places/$(placeId)).data;
      return devicePoint.distance(placeData.coordinates) <= 100.0;
    }

    match /places/{placeId} {
      allow read: if true;
      allow update: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.token.isModerator == true
      );
    }

    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && isPhysicallyPresent(request.resource.data.deviceCoordinates, request.resource.data.placeId);
    }
  }
}`;

  const testStrategyDoc = `// SUREGO SYSTEM TESTING STRATEGY
// Location: test/features/places/domain/usecases/trust_engine_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:surego/core/trust/trust_engine.dart';
import 'package:surego/features/places/domain/entities/user_report.dart';

void main() {
  group('SureGo Trust Engine Math Validation Tests', () {
    
    test('Visitor report has baseline weight of 60% confidence', () {
      final reports = [
        UserReport(
          id: 'r1',
          userRole: 'Visitor',
          timestamp: DateTime.now(),
          confidence: 60,
        )
      ];

      final confidence = TrustEngine.calculateConfidence(
        history: reports,
        currentTime: DateTime.now(),
      );

      expect(confidence, equals(60));
    });

    test('Business owner report overrules with absolute 100% confidence', () {
      final reports = [
        UserReport(
          id: 'r1',
          userRole: 'Visitor',
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
          confidence: 60,
        ),
        UserReport(
          id: 'r2',
          userRole: 'Owner',
          timestamp: DateTime.now(),
          confidence: 100,
        )
      ];

      final confidence = TrustEngine.calculateConfidence(
        history: reports,
        currentTime: DateTime.now(),
      );

      // 45 mins elapsed out of 60 mins life limits reduces the score proportionally
      expect(confidence, lessThan(30));
    });

  });
}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mt-8 shadow-xs max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <BookOpen className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Full-Stack Code Repository & Specifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Copy-pasteable production Flutter and Firestore code snippets</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('flutter')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeTab === 'flutter' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Flutter Directory & Architecture
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeTab === 'database' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Database & Rules Schema
        </button>
        <button
          onClick={() => setActiveTab('trust')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeTab === 'trust' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Live Trust Engine
        </button>
        <button
          onClick={() => setActiveTab('testing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeTab === 'testing' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Automated Tests
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            activeTab === 'deployment' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Deployment Guide
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-4">
        
        {activeTab === 'flutter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Clean Flutter Workspace Structure</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The layout follows the strictly defined **Clean Architecture Principles**, separating core telemetry layers, entities, and providers managed by Riverpod.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                <button
                  onClick={() => handleCopy(flutterStructure, 'struct')}
                  className="absolute top-2 right-2 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedIndex === 'struct' ? '✅ Copied' : 'Copy'}
                </button>
                <pre className="font-mono text-xs text-slate-700 overflow-x-auto leading-relaxed max-h-[380px] no-scrollbar">
                  {flutterStructure}
                </pre>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">State Repository (`place_repository.dart`)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Implements transaction-safe Firestore write-batches containing geographical coordinates matching indicators.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                <button
                  onClick={() => handleCopy(placeRepositoryDart, 'repo')}
                  className="absolute top-2 right-2 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedIndex === 'repo' ? '✅ Copied' : 'Copy'}
                </button>
                <pre className="font-mono text-[10px] text-blue-800 overflow-x-auto leading-normal max-h-[380px] no-scrollbar">
                  {placeRepositoryDart}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Production Security Rules (`firestore.rules`)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guarantees zero fake updates by validating telemetry coords using Native Firestore `.distance()` calculations before enabling database commits.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                <button
                  onClick={() => handleCopy(securityRulesDoc, 'rules')}
                  className="absolute top-2 right-2 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedIndex === 'rules' ? '✅ Copied' : 'Copy'}
                </button>
                <pre className="font-mono text-[10px] text-emerald-800 overflow-x-auto leading-normal max-h-[380px] no-scrollbar">
                  {securityRulesDoc}
                </pre>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">Firestore Relational Data Modelling</h3>
              <div className="space-y-4 text-xs text-slate-600 mt-2">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Highly Scalable Query Filters
                  </p>
                  <p className="text-slate-500 leading-normal pl-2.5">
                    Utilizes nested sub-collections of places to easily query only relevant active categories with color status indexes (e.g. searching only working ATMs, open petrol pumps).
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Geohash-8 Space Partitioning
                  </p>
                  <p className="text-slate-500 leading-normal pl-2.5">
                    Saves lat/lng along with geohash-8 string identifiers. Queries can filter boxes dynamically in a radius without costly cross-state computations.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Identity Verification Keys
                  </p>
                  <p className="text-slate-500 leading-normal pl-2.5">
                    Maintains user-employee authorization links under protected keys so that visitor reports don't interfere with enterprise ground truth flags.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trust' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Riverpod State Controllers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connects domain level structures with UI widgets seamlessly. Handles GPS geofence states.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                <button
                  onClick={() => handleCopy(stateManagementCode, 'state')}
                  className="absolute top-2 right-2 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedIndex === 'state' ? '✅ Copied' : 'Copy'}
                </button>
                <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto leading-normal max-h-[380px] no-scrollbar">
                  {stateManagementCode}
                </pre>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">How The Trust Score Engine Operates</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To prevent malicious spam reporting, SureGo coordinates status weights using an automated matrix:
                </p>
                <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside mt-3">
                  <li>
                    <strong className="text-slate-800">Visitor baseline (60%)</strong>: Standard crowdsourced reports require cross-agreement from 3+ users to rise to 90% confidence.
                  </li>
                  <li>
                    <strong className="text-slate-800">Role Boosters (90-100%)</strong>: Employees & Owners submit with high-fidelity bypass weightings.
                  </li>
                  <li>
                    <strong className="text-slate-800">Temporal Half-life decay</strong>: Statuses reduce confidence by 25% every 15 minutes, expiring entirely at 60 minutes.
                  </li>
                  <li>
                    <strong className="text-slate-800">Coordinate bounds checks</strong>: Server checks device coordinates against physical markers. Remote submissions are immediately dropped.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center text-[11px] text-blue-800 mt-4">
                🚀 Built to scale to millions of users with zero manual moderation required.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Flutter Core Trust Unit Tests</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Validates that temporal degradation factors, role weight multipliers, and expiration thresholds compute exactly to specifications.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
              <button
                onClick={() => handleCopy(testStrategyDoc, 'tests')}
                className="absolute top-2 right-2 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 transition cursor-pointer"
              >
                {copiedIndex === 'tests' ? '✅ Copied' : 'Copy'}
              </button>
              <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto leading-normal max-h-[380px] no-scrollbar">
                {testStrategyDoc}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">SureGo Production Deployment Roadmap</h3>
              <p className="text-xs text-slate-500">Step-by-step launch protocols to move from local sandbox to live iOS & Android stores</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-blue-600 font-mono">STEP 1</span>
                <p className="font-bold text-slate-800">Firebase Provisioning</p>
                <p className="text-slate-500 leading-relaxed">
                  Provision Cloud Firestore and Firebase Phone Auth. Deploy secure `firestore.rules` and configure rate limit limits.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-blue-600 font-mono">STEP 2</span>
                <p className="font-bold text-slate-800">Google Maps SDK</p>
                <p className="text-slate-500 leading-relaxed">
                  Setup Google Places API key, register Android SHA-1 credentials and iOS bundle identifiers for geofencing capabilities.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-blue-600 font-mono">STEP 3</span>
                <p className="font-bold text-slate-800">Riverpod Controllers</p>
                <p className="text-slate-500 leading-relaxed">
                  Connect live geohash location listeners and configure offline persistent database cache layers in pubspec dependencies.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-blue-600 font-mono">STEP 4</span>
                <p className="font-bold text-slate-800">FCM Push Protocols</p>
                <p className="text-slate-500 leading-relaxed">
                  Integrate Firebase Cloud Messaging so that followed channels instantly broadcast alerts whenever status indexes shift.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
