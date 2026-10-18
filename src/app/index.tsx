import { FlatList, StyleSheet, Text, View, Image } from 'react-native';
import defaultTestData from '../data/tests.json';
import { useRouter, useFocusEffect } from 'expo-router';
import PushButton from '@/components/PushButton';
import { useFonts } from 'expo-font';
import { useState, useEffect, useCallback } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function HomeScreen() {
  const router = useRouter();
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    'Actay-Regular': require('../../assets/fonts/Actay-Regular.otf'),
    'ActayWide-Bold': require('../../assets/fonts/ActayWide-Bold.otf')
  });

  useFocusEffect(
    useCallback(() => {
      const initData = async () => {
        try {
          const storedMistakes = await AsyncStorage.getItem('allMistakes');
          if (storedMistakes) {
            setTotalMistakes(JSON.parse(storedMistakes).length);
          }

          const storedCustomData = await AsyncStorage.getItem('customTestData');
          
          let activeSubjects = defaultTestData.subjects;

          if (storedCustomData) {
            const parsedData = JSON.parse(storedCustomData);
            activeSubjects = parsedData.subjects;
          }

          setSubjects(activeSubjects);
          
          let qCount = 0;
          activeSubjects.forEach((element: any) => {
            qCount += element.questions.length;
          });
          setTotalQuestions(qCount);

        } catch (e) {
          console.error('Ошибка инициализации данных:', e);
          setSubjects(defaultTestData.subjects);
        } finally {
          setIsDataLoaded(true);
        }
      };

      initData();
      
      // Функция очистки (опционально, но хорошая практика для useFocusEffect)
      return () => {
        // Здесь можно сбросить состояние, если нужно, но в данном случае нам не надо
      };
    }, []) // Пустой массив зависимостей здесь означает, что логика внутри не меняется
  );

  if (!fontsLoaded || !isDataLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', fontFamily: 'Actay-Regular' }}>Загрузка...</Text>
      </View>
    );
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

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.headerArea}>    
              <View style={styles.headerElement}>
                <Text style={styles.headerText}>Предметы</Text>
                <Text style={styles.headerNumber}>{subjects.length}</Text>
              </View>
              <View style={styles.headerElement}>
                <Text style={styles.headerText}>Ошибки</Text>
                <Text style={styles.headerNumber}>{totalMistakes}</Text> 
                <View style={styles.buttonTop}>
                  <PushButton text="Проработать" 
                              backgroundColor='#0A99D2'
                              onPush={() => { router.push(`/mistakesTest`) }} />
                </View>
              </View>
              <View style={styles.headerElement}>
                <Text style={styles.headerText}>Вопросы</Text>
                <Text style={styles.headerNumber}>{totalQuestions}</Text>
              </View>
            </View>

            <View style={styles.buttonAddSubjects}>
              <PushButton 
                image={require('../../src/media/addSign.png')} 
                backgroundColor='#6B22F2'
                onPush={() => { router.push(`/subjectsConstructor`) }} 
              />
            </View>
          </View>
        }

        renderItem={({ item }) => (
          <View style={styles.subjectArea}>
            <View style={styles.subjectNameAndEditSign}>
              <PushButton image={require('../media/editIcon.png')}
                          onPush={() => { router.push(`/editSubject?subjectId=${item.id}`) }}/>
              <Text style={styles.normalText}>{item.name}</Text>
            </View> 
            <View style={styles.buttonsWrapper}>
              <PushButton 
                text={"Вопросы"} 
                onPush={() => { router.push(`/questions?subjectId=${item.id}`) }}
                backgroundColor={"#393B50"}
              />
              <PushButton 
                text={"Тест"} 
                onPush={() => { router.push(`/test?subjectId=${item.id}`) }}
                backgroundColor={"#0A99D2"}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#232227',
    paddingBottom: 150,
    paddingTop: 40
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'ActayWide-Bold'
  },
  subjectArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subjectNameAndEditSign:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  normalText: {
    fontSize: 14,
    textAlign: 'left',
    color: 'white', 
    width: '77%',
    padding: 10,
    fontFamily: 'ActayWide-Bold'
  },
  secondaryText: {
    fontSize: 14,
    textAlign: 'right',
    color: '#848188'
  },
  headerContainer: {
    gap: 100,
    alignItems: 'center'
  },

  headerArea: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 80,
  },
  headerElement: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'ActayWide-Bold',
    color: '#EBEAF7',
    fontSize: 14,
    textAlign: 'center'
  },
  headerNumber: {
    fontFamily: 'ActayWide-Bold',
    color: '#EBEAF7',
    fontSize: 20,
    textAlign: 'center'
  },
  buttonTop: {
    marginTop: 20
  },
  buttonAddSubjects: {
    flex: 1,
    alignSelf: 'flex-end',
    marginRight: 20
  },
  buttonsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 10
  },
  backgroundImage1: {
    position: 'absolute',
    top: -120,
    zIndex: 1,
    alignSelf: 'center',
    pointerEvents: 'none'
  },
  backgroundImage2: {
    position: 'absolute',
    bottom: -250,
    zIndex: 1,
    alignSelf: 'center',
    height: '70%',
    pointerEvents: 'none'
  }
});