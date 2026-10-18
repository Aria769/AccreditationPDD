import { useState } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import PushButton from "./PushButton";

type QuestionImageViewerProps = {
  uri?: string;
};

export default function QuestionImageViewer({ uri }: QuestionImageViewerProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  // Если картинки нет, ничего не рендерим
  if (!uri || uri.trim() === "") {
    return null;
  }

  return (
    <>
      {/* Миниатюра вопроса */}
      <View style={styles.questionImageContainer}>
        <TouchableOpacity
          onPress={() => setShowFullImage(true)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri }}
            style={styles.questionImage}
            resizeMode="cover"
          />
          <Text style={styles.imageHint}>Нажмите для увеличения</Text>
        </TouchableOpacity>
      </View>

      {/* Полноэкранный модальный просмотр */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFullImage(false)}>
          <View style={styles.fullScreenContainer}>
            <Image
              source={{ uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <View style={styles.closeButton}>
              <PushButton
                image={require("../media/crossSign.png")}
                imageWidth={32}
                onPush={() => setShowFullImage(false)}
                unStyled={true}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  questionImageContainer: {
    marginVertical: 15,
    alignItems: "center",
    width: "100%",
    borderRadius: 10,
    overflow: 'hidden'
  },
  questionImage: {
    width: "100%",
    //height: 200,
    aspectRatio: 4/3,
    borderRadius: 10,
  },
  imageHint: {
    color: "#848188",
    fontSize: 10,
    marginTop: 5,
    fontFamily: "Actay-Regular",
    alignSelf: 'center'
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});
