type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

// Глобальный хук для показа алертов
let showAlertCallback: ((
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => void) | null = null;

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (showAlertCallback) {
    showAlertCallback(title, message, buttons);
  } else {
    // Фоллбэк на случай, если алерт вызван до монтирования Layout (очень редко)
    if (typeof window !== "undefined" && window.alert) {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    buttons?.[0]?.onPress?.();
  }
};

// Функция для установки колбэка (вызывается из _layout.tsx)
export const setShowAlertHandler = (
  callback: (title: string, message?: string, buttons?: AlertButton[]) => void
) => {
  showAlertCallback = callback;
};