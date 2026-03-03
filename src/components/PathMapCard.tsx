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

export function PathMapCard({
  coordinates,
  lineColor,
  permissionGranted,
  isLoading,
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
        {coordinates.length > 1 ? (
          <Polyline coordinates={coordinates} strokeColor={lineColor} strokeWidth={5} />
        ) : null}

        {coordinates.length > 0 ? <Marker coordinate={coordinates[0]} title="Start" /> : null}
        {coordinates.length > 1 ? (
          <Marker coordinate={coordinates[coordinates.length - 1]} title="Latest" pinColor="#ef4444" />
        ) : null}
      </MapView>

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
    backgroundColor: '#0b1220',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    gap: 10,
  },
  loadingText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});
