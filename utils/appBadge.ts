import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function setAppIconBadgeCount(count: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const n = Math.max(0, Math.min(99999, Math.floor(count)));
    await Notifications.setBadgeCountAsync(n);
  } catch {
    // Badge not supported on some Android launchers / simulators
  }
}

export async function bumpAppIconBadge(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const current = await Notifications.getBadgeCountAsync();
    await Notifications.setBadgeCountAsync(current + 1);
  } catch {
    // ignore
  }
}

export async function clearAppIconBadge(): Promise<void> {
  await setAppIconBadgeCount(0);
}

export function countUnreadNotifications(
  items: { isRead?: boolean }[],
): number {
  return items.filter((n) => !n.isRead).length;
}
