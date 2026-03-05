# Path Tracker (React Native)

A cross-platform (iOS + Android) path recording app built with React Native + Expo.

## Features Implemented

1. Menu structure
- `Footprint`: shows all historical points.
- `Today`: shows only today's path.
- Quick tabs: `Yesterday` and `2 days ago`.
- `More`: opens a modal list for dates older than 3 days.

2. Automatic path recording
- Start recording with `Start Recording`.
- Captures one location point every ~4 seconds.
- Uses foreground capture + background location task (best effort).
- Points are saved to local storage (`AsyncStorage`) with dedupe and rendered on the map.

3. Footprint behavior
- In `Footprint`, all historical points are shown as a point cloud (no line).

4. Date-specific behavior
- In `Today` or any date tab, only that day’s points are shown and connected as a route line.
- Date route color is theme orange by default, with a reserved override entry point for future customization.

## Tech Stack

- React Native (Expo)
- `react-native-maps` (map + polyline + markers)
- `expo-location` (GPS)
- `expo-task-manager` (background location task)
- `@react-native-async-storage/async-storage` (local persistence)

## Run

```bash
npm install
npm run start
```

Then use Expo:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan QR code with Expo Go on a real device

## Local Debug Hot Reload (Fast Refresh)

This project uses Expo's Fast Refresh for local debugging hot updates.

```bash
npm install
npm run dev
```

Recommended local debug commands:
- `npm run dev`: default local hot update mode (clear cache).
- `npm run dev:android`: open Android emulator + hot update.
- `npm run dev:ios`: open iOS simulator + hot update.
- `npm run dev:tunnel`: use tunnel mode if LAN connection is unstable.

Fast Refresh checklist:
- Ensure app is connected to Metro dev server.
- Open developer menu and confirm `Fast Refresh` is enabled.
- Save any `.tsx/.ts` file and UI should update automatically.
- If refresh gets stuck, press `r` in terminal to reload or restart `npm run dev`.

## Notes

- Location permission is required for recording.
- Background recording is best effort due OS policy (especially after force-kill).
