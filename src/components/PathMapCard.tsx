import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';

import { DEFAULT_REGION } from '../constants/path';

type PathMapCardProps = {
  coordinates: LatLng[];
  lineColor: string;
  permissionGranted: boolean;
  isLoading: boolean;
};

/**
 * Full-screen map container responsible for:
 * - camera fitting based on provided coordinates
 * - rendering current polyline + start/end markers
 * - optional loading overlay while persisted data is being restored
 */
export function PathMapCard({
  coordinates,
  lineColor,
  permissionGranted,
  isLoading,
}: PathMapCardProps): JSX.Element {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // No camera operation needed before coordinates exist.
    if (!mapRef.current || coordinates.length === 0) {
      return;
    }

    // For one-point paths, center with a focused zoom window.
    if (coordinates.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
      return;
    }

    // For multi-point paths, fit the whole route with UI-safe paddings.
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 170, right: 34, bottom: 185, left: 34 },
      animated: true,
    });
  }, [coordinates]);

  return (
    <View style={styles.mapCard}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
      >
        {/* Draw route line only when at least two points exist. */}
        {coordinates.length > 1 ? (
          <Polyline coordinates={coordinates} strokeColor={lineColor} strokeWidth={5} />
        ) : null}

        {/* First point marker helps user identify route origin. */}
        {coordinates.length > 0 ? <Marker coordinate={coordinates[0]} title="Start" /> : null}
        {/* Last point marker represents latest known location in this view. */}
        {coordinates.length > 1 ? (
          <Marker coordinate={coordinates[coordinates.length - 1]} title="Latest" pinColor="#ef4444" />
        ) : null}
      </MapView>

      {/* Data hydration overlay shown while initial storage load is running. */}
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fb923c" />
          <Text style={styles.loadingText}>Loading local paths...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    gap: 10,
  },
  loadingText: {
    color: '#334155',
    fontWeight: '600',
  },
});
