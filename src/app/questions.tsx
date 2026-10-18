import QuestionCard from "@/components/QuestionCard";
import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View, Image } from "react-native";
import { Question } from "@/types/question";
import PushButton from '../components/PushButton';
import { useRouter } from 'expo-router';
import { getAllSubjects } from "../utils/getSubjects";
import { useState, useEffect } from "react";

export default function QuestionsScreen() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  
    useEffect(() => {
      const loadData = async () => {
        const allSubjects = await getAllSubjects();
        setSubjects(allSubjects);
      };
      loadData();
    }, []);

  const { subjectId } = useLocalSearchParams();
  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <View>
        <Text>Предмет не найден</Text>
      </View>
    );
  }


  const getReviewAnswer = (item : Question) =>{
    if(item.type === "written-answer-question"){
      return (item.correctAnswer as string[])[0]
    }
    return item.correctAnswer;
  }

  return (
    <View style={styles.container}>
      <Image
                source={require('../media/topLight.png')}
                style={styles.backgroundImage1}
                resizeMode="cover"
                />
            <Image
                source={require('../media/KiraLookingUp.png')}
                style={styles.backgroundImage2}
                resizeMode="contain"
                />
              

      <View style={styles.header}>
              <View style={styles.cross}>
                <PushButton
                  image={require("../media/crossSign.png")}
                  imageWidth={32}
                  onPush={() => router.push(`/`)}
                  unStyled={true}
                />
              </View>
      
              <Text style={styles.subjectNameText}>{subject.name}</Text>
      
      </View>


      <View style={styles.questionsWrapper}>                       
        
          <FlatList
            style={styles.questionsContainer}
            showsVerticalScrollIndicator={false}
            data={subject.questions}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.question}>
                <View style={styles.questionTextWrapper}>
                  <QuestionCard question={item} 
                                withButton={false}
                                savedAnswer={getReviewAnswer(item)} />
                </View>
              </View>
            )}
          />
      </View> 
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#232227',
    paddingTop: 20,
    paddingBottom: 150,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    gap: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  subjectNameText: {
    textAlign: "left",
    color: "white",
    fontFamily: "ActayWide-Bold",
    fontSize: 18,
    flex: 1,
  },


  questionsWrapper: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20
  },

  questionsContainer: {
    //paddingHorizontal: 20
  },

  question: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#403E47",
    paddingBottom: 20
  },

  questionTextWrapper:{
    paddingHorizontal: 20,
    paddingTop: 20
  },

  rightAnswer: {
    color: "#676767",
    textAlign: "right",
  },

  cross:{
    // paddingLeft: 15,
    // paddingTop: 34,
    // position: 'absolute',
    // zIndex: 1
  },

  backgroundImage1:{
    position: 'absolute',
    top: -120,
    zIndex: 1,
    alignSelf: 'center',
    pointerEvents: 'none'
  },

  backgroundImage2:{
    position: 'absolute',
    bottom: -250,
    zIndex: 1,
    alignSelf: 'center',
    height: '70%',
    pointerEvents: 'none'
  }
});
