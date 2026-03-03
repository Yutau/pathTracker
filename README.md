# Path Tracker (React Native)

A cross-platform (iOS + Android) path recording app built with React Native + Expo.

## Features Implemented

1. Menu structure
- `Footprint`: shows all historical paths.
- `Today`: shows only today's path.
- Previous 3 days: `Yesterday`, `Day Before Yesterday`, and `3 Days Ago` with date labels.
- `More`: opens a modal list for dates older than 3 days.

2. Automatic path recording
- Start recording with `Start Recording`.
- Captures one location point every ~20 seconds.
- Points are saved to local storage (`AsyncStorage`) and rendered on the map.

3. Footprint behavior
- In `Footprint`, all points are sorted by timestamp and connected as one continuous colored line.

4. Date-specific behavior
- In `Today` or any date tab, only that day’s points are shown independently.

## Tech Stack

- React Native (Expo)
- `react-native-maps` (map + polyline + markers)
- `expo-location` (GPS)
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
- The current implementation records in foreground while the app is active.
- For background tracking, add task manager + background location workflow.
