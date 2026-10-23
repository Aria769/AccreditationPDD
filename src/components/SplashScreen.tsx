import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";

type SplashScreenProps = {
  isReady: boolean;
};

export default function SplashScreen({ isReady }: SplashScreenProps) {
  const [currentImage, setCurrentImage] = useState(0); // 0 = open, 1 = half, 2 = full
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Простая и плавная анимация моргания
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const blink = () => {
      // Ждём 3-6 секунд между морганиями
      timeoutId = setTimeout(
        () => {
          // Быстрое моргание: open -> half -> full -> half -> open
          setCurrentImage(1); // half (60ms)

          setTimeout(() => {
            setCurrentImage(2); // full (100ms)

            setTimeout(() => {
              setCurrentImage(1); // half (60ms)

              setTimeout(() => {
                setCurrentImage(0); // open
                blink(); // следующий цикл
              }, 60);
            }, 100);
          }, 60);
        },
        800 + Math.random() * 1000,
      );
    };

    blink();

    return () => clearTimeout(timeoutId);
  }, []);

  // Плавное исчезновение
  useEffect(() => {
    if (isReady) {
      // Увеличили время до 3000 мс (3 секунды), чтобы точно успеть заметить моргание
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!isVisible) return null;

  const images = [
    require("../media/KiraOpenEyes.png"),
    require("../media/KiraBlinking1.png"),
    require("../media/KiraBlinking2.png"),
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("../media/topLight.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <Image
        source={require("../../assets/images/splash-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ИЗМЕНЕНИЕ: Рендерим все 3 состояния, но показываем только активное через opacity */}
      <Image
        source={require("../media/KiraOpenEyes.png")}
        style={[styles.kira, { opacity: currentImage === 0 ? 1 : 0 }]}
        resizeMode="contain"
      />
      <Image
        source={require("../media/KiraBlinking1.png")}
        style={[styles.kira, { opacity: currentImage === 1 ? 1 : 0 }]}
        resizeMode="contain"
      />
      <Image
        source={require("../media/KiraBlinking2.png")}
        style={[styles.kira, { opacity: currentImage === 2 ? 1 : 0 }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#232227",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 100,
  },
  kira: {
    position: "absolute",
    bottom: -200,
    zIndex: 1,
    alignSelf: "center",
    height: "70%",
  },
  backgroundImage: {
    position: "absolute",
    top: '-40%',
    height: '70%',
    zIndex: 2,
    alignSelf: "center",
    width: "100%",
  },
});
