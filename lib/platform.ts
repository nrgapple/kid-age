import { Alert, Platform, Share } from "react-native";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

export function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
    return;
  }

  Alert.alert(title, message);
}

export function confirmAction({
  title,
  message,
  confirmText = "Continue",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmOptions) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    {
      text: confirmText,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

export async function shareMessage(message: string) {
  if (Platform.OS === "web") {
    if (navigator.share) {
      await navigator.share({ text: message });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return;
    }

    showMessage("Share unavailable", "Your browser does not support sharing or clipboard access.");
    return;
  }

  await Share.share({ message });
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
