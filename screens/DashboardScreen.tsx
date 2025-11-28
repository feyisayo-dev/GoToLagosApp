import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
// Ensure you have installed: npx expo install react-native-maps react-native-svg
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// Ensure you have installed: npx expo install @expo/vector-icons
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// --- CONSTANTS & THEME ---
const COLORS = {
  primary: '#1BAF6C',    // Clean Green
  secondary: '#FFFFFF',  // White
  dark: '#1A1A1A',       // Text Black
  grey: '#ECECEC',       // Soft Grey
  accent: '#72D4A0',     // Mint
  textLight: '#888888',
  mapLine: '#1BAF6C',
};

const { width, height } = Dimensions.get('window');

// --- MOCK DATA ---
const MOCK_STOPS = [
  {
    id: "stop_001",
    name: "Ojota Terminal",
    coords: { latitude: 6.6018, longitude: 3.3903 },
    priceToNext: 150,
    time: "10:00 AM"
  },
  {
    id: "stop_002",
    name: "Ketu Bus Stop",
    coords: { latitude: 6.5866, longitude: 3.3863 },
    priceToNext: 200,
    time: "10:15 AM"
  },
  {
    id: "stop_003",
    name: "Maryland Mall",
    coords: { latitude: 6.5659, longitude: 3.3670 },
    priceToNext: 250,
    time: "10:30 AM"
  },
  {
    id: "stop_end",
    name: "Yaba Tech",
    coords: { latitude: 6.5176, longitude: 3.3712 },
    priceToNext: 0,
    time: "10:55 AM"
  }
];

// Calculate Route Totals
const TOTAL_FARE = MOCK_STOPS.reduce((acc, stop) => acc + stop.priceToNext, 0);
const TOTAL_DIST = "12.4 km";
const TOTAL_ETA = "32 mins";

// --- COMPONENTS ---

// 1. Radar Pulse Animation Component
const RadarPulse = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={styles.userDot} />
    </View>
  );
};

// 2. Input Pill Component
const LocationInput = ({ icon, placeholder, value, isSource, autoFocus }: any) => (
  <View style={styles.inputCard}>
    <View style={styles.inputIconContainer}>
      {isSource ? (
        <View style={styles.sourceDot}>
          <Animated.View style={styles.sourcePulse} />
        </View>
      ) : (
        <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
      )}
    </View>
    <View style={styles.inputTextContainer}>
      <Text style={styles.inputLabel}>{isSource ? "Current Location" : "Destination"}</Text>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={value}
        placeholderTextColor={COLORS.textLight}
        autoFocus={autoFocus}
      />
    </View>
    {isSource && (
      <View style={styles.gpsIcon}>
        <MaterialIcons name="my-location" size={18} color={COLORS.primary} />
      </View>
    )}
  </View>
);

export default function DashboardScreen() {
  const [startLoc, setStartLoc] = useState("Ojota Terminal");
  const [endLoc, setEndLoc] = useState("Yaba Tech");

  // Extract coordinates for the Polyline
  const routeCoordinates = MOCK_STOPS.map(stop => stop.coords);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* --- MAP BACKGROUND --- */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 6.5659, // Centered roughly on Lagos Mainland
          longitude: 3.3800,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        customMapStyle={mapStyle} // Defined below
        provider={PROVIDER_GOOGLE}
      >
        {/* The Route Line */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={COLORS.primary}
          strokeWidth={4}
        />

        {/* Bus Stops Markers */}
        {MOCK_STOPS.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={stop.coords}
            title={stop.name}
            description={`Fare: ₦${stop.priceToNext}`}
          >
            <View style={styles.stopMarker}>
              <View style={styles.stopMarkerInner} />
            </View>
          </Marker>
        ))}

        {/* User Location (Mocked at Start) */}
        <Marker coordinate={MOCK_STOPS[0].coords}>
          <RadarPulse />
        </Marker>
      </MapView>

      {/* --- HEADER INPUTS --- */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.inputWrapper}>
          <LocationInput
            isSource={true}
            value={startLoc}
            placeholder="Detecting location..."
          />
          <View style={styles.connectorLine} />
          <LocationInput
            isSource={false}
            value={endLoc}
            placeholder="Where are you going?"
          />
        </View>
      </SafeAreaView>

      {/* --- BOTTOM SHEET (Fare & Route) --- */}
      <View style={styles.bottomSheet}>
        {/* Grabber Handle */}
        <View style={styles.sheetHandle} />

        {/* Route Summary Card */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total Fare</Text>
            <Text style={styles.summaryPrice}>₦{TOTAL_FARE}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{TOTAL_ETA}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>{TOTAL_DIST}</Text>
          </View>
        </View>

        {/* Ride Type Pill */}
        <View style={styles.transitTypeRow}>
          <View style={styles.transitBadge}>
            <FontAwesome5 name="bus" size={14} color="white" />
            <Text style={styles.transitBadgeText}>Bus Transit</Text>
          </View>
          <Text style={styles.arrivalText}>Arriving in 4 mins</Text>
        </View>

        {/* Stops List */}
        <Text style={styles.stopsHeader}>Route Stops</Text>
        <ScrollView style={styles.stopsList}>
          {MOCK_STOPS.map((stop, index) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopTimeline}>
                <View style={[styles.timelineDot, index === MOCK_STOPS.length - 1 && { backgroundColor: COLORS.dark }]} />
                {index !== MOCK_STOPS.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopTime}>{stop.time}</Text>
              </View>
              {stop.priceToNext > 0 && (
                <View style={styles.stopPriceBadge}>
                  <Text style={styles.stopPriceText}>+₦{stop.priceToNext}</Text>
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  map: {
    width: '100%',
    height: '100%',
    ...StyleSheet.absoluteFillObject,
  },

  // Header Inputs
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  inputWrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  connectorLine: {
    position: 'absolute',
    left: 24, // Align with dots
    top: 45,
    height: 25,
    width: 2,
    backgroundColor: '#ddd',
    zIndex: -1,
  },
  inputIconContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  sourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputField: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    paddingVertical: 2,
  },
  gpsIcon: {
    padding: 5,
    backgroundColor: '#eafff4',
    borderRadius: 20
  },

  // Markers
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 175, 108, 0.4)', // Primary with opacity
    position: 'absolute',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
  },
  stopMarker: {
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.dark,
  },
  stopMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.dark,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '45%', // Takes up bottom 45%
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  transitTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  transitBadge: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    gap: 5
  },
  transitBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  arrivalText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12
  },
  stopsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 10,
    marginTop: 5,
  },
  stopsList: {
    flex: 1,
  },
  stopItem: {
    flexDirection: 'row',
    height: 50,
  },
  stopTimeline: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.grey,
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.grey,
    marginVertical: 2,
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  stopTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  stopPriceBadge: {
    backgroundColor: '#eafff4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    height: 24,
    justifyContent: 'center'
  },
  stopPriceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700'
  },
  confirmBtn: {
    backgroundColor: COLORS.dark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  confirmBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  sourcePulse: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 175, 108, 0.3)', // Faint primary color
    zIndex: -1,
  },
});

// Minimalist Map Style (Removes POIs for cleaner look)
const mapStyle = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "lightness": 100 }, { "visibility": "simplified" }]
  }
];