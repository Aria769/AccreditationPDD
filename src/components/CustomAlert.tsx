import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler, // ✅ Добавляем для обработки кнопки "Назад" на Android
} from "react-native";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type CustomAlertProps = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  visible: boolean;
  onHide: () => void;
};

export default function CustomAlert({
  title,
  message,
  buttons,
  visible,
  onHide,
}: CustomAlertProps) {
  const [isClosing, setIsClosing] = useState(false);

  // ✅ Обработка кнопки "Назад" на Android
  useEffect(() => {
    if (visible) {
      const onBackPress = () => {
        // Если есть кнопка отмены, нажимаем её, иначе просто закрываем
        const cancelBtn = buttons.find((b) => b.style === "cancel");
        if (cancelBtn) {
          cancelBtn.onPress?.();
        }
        onHide();
        return true; // Предотвращаем стандартное поведение (закрытие приложения)
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
        );
        
    return () => subscription.remove();
    }
  }, [visible, buttons, onHide]);

  const handleButtonPress = (button: AlertButton) => {
    setIsClosing(true);
    button.onPress?.();
    setTimeout(() => {
      onHide();
      setIsClosing(false);
    }, 10);
  };

  // ✅ УБРАЛИ: if (Platform.OS !== "web") return null;
  // Теперь компонент рендерится везде

  const buttonsToShow =
    buttons.length > 0 ? buttons : [{ text: "OK", style: "default" as const }];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onHide} // ✅ Работает и на Android, и на iOS (свайп вниз)
    >
      <View style={styles.overlay}>
        <View style={[styles.alertBox, isClosing && styles.closing]}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonsContainer}>
            {buttonsToShow.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "cancel" && styles.cancelButton,
                  button.style === "destructive" && styles.destructiveButton,
                  buttonsToShow.length > 1 &&
                    index === 0 &&
                    styles.firstButton,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.cancelButtonText,
                    button.style === "destructive" &&
                      styles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // ✅ Чуть темнее фон для лучшей читаемости на мобильных
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#1D1C23",
    borderRadius: 16, // ✅ Чуть больше скругление для iOS
    padding: 24,
    width: "100%",
    maxWidth: 340, // ✅ Оптимальная ширина для мобильных экранов
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closing: {
    opacity: 0,
    transform: [{ scale: 0.95 }],
  },
  title: {
    fontFamily: "ActayWide-Bold",
    fontSize: 18,
    color: "#EBEAF7",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontFamily: "Actay-Regular",
    fontSize: 15,
    color: "#848188",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center", // ✅ Центрируем кнопки
    gap: 12, // ✅ Используем gap вместо margin для чистоты кода
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A99D2",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#393B50",
  },
  destructiveButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    fontFamily: "ActayWide-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "#848188",
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
});