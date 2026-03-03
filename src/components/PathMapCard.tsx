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
  statusMessage: string;
};

export function PathMapCard({
  coordinates,
  lineColor,
  permissionGranted,
  isLoading,
  statusMessage,
}: PathMapCardProps): JSX.Element {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current || coordinates.length === 0) {
      return;
    }

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

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
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
        {coordinates.length > 1 ? (
          <Polyline coordinates={coordinates} strokeColor={lineColor} strokeWidth={5} />
        ) : null}

        {coordinates.length > 0 ? <Marker coordinate={coordinates[0]} title="Start" /> : null}
        {coordinates.length > 1 ? (
          <Marker coordinate={coordinates[coordinates.length - 1]} title="Latest" pinColor="#ef4444" />
        ) : null}
      </MapView>

      <View style={styles.statusChip}>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading local paths...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    marginTop: 14,
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  statusChip: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    gap: 10,
  },
  loadingText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
