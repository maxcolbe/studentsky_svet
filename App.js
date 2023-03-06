// imports
import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  ImageBackground,
} from "react-native";
import { NavigationContainer, useIsFocused } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import questions from "./questions.json";
import teoria from "./teoria.json";
import Swiper from "react-native-swiper";
import AsyncStorage from "@react-native-async-storage/async-storage";

// create the stack and tab navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// AsyncStorage - update number of completed tests after finishing a test
async function increment_completed_tests() {
  try {
    // Get the current number of completed tests from AsyncStorage
    const completed_tests = await AsyncStorage.getItem("completed_tests");
    let count = 0;
    if (completed_tests !== null) {
      count = parseInt(completed_tests);
    }
    // Increment the count and store it back into AsyncStorage
    await AsyncStorage.setItem("completed_tests", (count + 1).toString());
  } catch (error) {
    console.log(error);
  }
}

// AsyncStorage - get number of completed tests
async function get_completed_tests() {
  try {
    // Get the current number of completed tests from AsyncStorage
    const completed_tests = await AsyncStorage.getItem("completed_tests");
    if (completed_tests !== null) {
      return completed_tests;
    } else {
      return "0";
    }
  } catch (error) {
    console.log(error);
  }
}

const App = () => {
  const [username, setUsername] = React.useState(null);

  React.useEffect(() => {
    // Check if the username has been set
    AsyncStorage.getItem("username").then((value) => {
      if (value !== null) {
        // The username has already been set
        setUsername(value);
      } else {
        // The username hasn't been set yet
        // Show a prompt for the user to set a username
        Alert.prompt("Zadajte svoje meno", null, (name) => {
          AsyncStorage.setItem("username", name);
          setUsername(name);
        });
      }
    });
  }, []);
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          headerShown: false,
          headerStyle: { backgroundColor: "#1C385D" },
          headerShadowVisible: false,
          tabBarStyle: { backgroundColor: "#1C385D", borderTopWidth: 0 },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
            color: "#ffffff",
          },
          tabBarIcon: ({ color }) => {
            let iconName;

            if (route.name === "Home_tab") {
              iconName = "home-outline";
            } else if (route.name === "Profile_tab") {
              iconName = "person-circle-outline";
            }
            return <Ionicons name={iconName} size={30} color={color} />;
          },
          tabBarActiveTintColor: "#0197E4",
          tabBarInactiveTintColor: "white",
        })}
      >
        <Tab.Screen name="Home_tab" component={Home_Tab} />
        <Tab.Screen
          name="Profile_tab"
          component={Profile_Tab}
          options={{ headerShown: true, title: "Profil" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const Home_Tab = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1C385D" },
        headerShadowVisible: false,
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 30,
          color: "white",
        }
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home_Screen}
        options={({ navigation }) => ({
          headerStyle: { backgroundColor: "#134F71" },
          title: "Domov",
          headerLeft: () => (
            <Ionicons
              onPress={() => navigation.navigate("About")}
              name="information-circle-outline"
              size={30}
              color="white"
              style={{marginBottom: 10}}
            />
          ),
        })}
      />
      <Stack.Screen name="Topics" component={Topics_Screen} />
      <Stack.Screen
        name="Tests"
        component={Tests_Screen}
        options={{ gestureDirection: false }}
      />
      <Stack.Screen
        name="Teoria"
        component={Teoria_Screen}
        options={({ navigation, route }) => {
          const { subject, topic, test } = route.params;
          return {
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerButtonContainer}
                onPress={() =>
                  navigation.navigate("Quiz", {
                    subject: subject,
                    topic: topic,
                    test: test,
                  })
                }
              >
                <Text style={styles.headerButtonText}>Spustiť Test</Text>
              </TouchableOpacity>
            ),
          };
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={Quiz_Screen}
        options={{ animation: "slide_from_bottom", gestureEnabled: false }}
      />
      <Stack.Screen
        name="About"
        component={About_Screen}
        options={{ animation: "fade_from_bottom", title: "About" }}
      />
    </Stack.Navigator>
  );
};

const Profile_Tab = () => {
  const [completed_tests, setcompleted_tests] = React.useState("0");
  const [username, setUsername] = React.useState("");
  const isFocused = useIsFocused();

  if (isFocused) {
    async function updatecompleted_tests() {
      const newcompleted_tests = await get_completed_tests();
      setcompleted_tests(newcompleted_tests);
    }
    updatecompleted_tests();
  }

  React.useEffect(() => {
    // Retrieve username from AsyncStorage
    async function getUsername() {
      const username = await AsyncStorage.getItem("username");
      setUsername(username);
    }
    getUsername();
  }, []);

  const handleResetProgress = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            setcompleted_tests(0);
            AsyncStorage.setItem("completed_tests", "0");
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };
  async function handleNameChange() {
    Alert.prompt("Zadajte Vase meno", null, (text) => {
      AsyncStorage.setItem("username", text);
      setUsername(text);
    });
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "transparent",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 20,
        }}
      >
        <Ionicons name="person-circle" size={100} color="lightblue" />
        <Text style={[styles.buttonText, {color: "white"}]}>{username}</Text>
      </View>
      <Text style={{color: "#ffffff", fontSize: 25, fontWeight: "bold"}}>Tests completed: {completed_tests}</Text>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "blue",
            width: "60%",
            paddingHorizontal: 5,
            paddingVertical: 8,
            margin: 10,
            height: 50,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
          onPress={() => handleNameChange()}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "white", fontWeight: "bold" }}>
            Change Username
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "red",
            width: "60%",
            paddingHorizontal: 5,
            paddingVertical: 8,
            margin: 10,
            height: 50,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
          onPress={() => handleResetProgress()}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "white", fontWeight: "bold" }}>
            Reset Progress
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const Home_Screen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require("./assets/background_simple.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View
        style={[
          styles.container,
          { justifyContent: "flex-start", backgroundColor: "transparent" },
        ]}
      >
        <TouchableOpacity
          style={[styles.buttonContainer, { marginTop: "15%" }]}
          onPress={() =>
            navigation.navigate("Topics", { subject: "Slovenský Jazyk" })
          }
        >
          <Text style={styles.buttonText}>Slovenský Jazyk</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() =>
            navigation.navigate("Topics", { subject: "Anglický Jazyk" })
          }
        >
          <Text style={styles.buttonText}>Anglický Jazyk</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() =>
            navigation.navigate("Topics", { subject: "Matematika" })
          }
        >
          <Text style={styles.buttonText}>Matematika</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const Topics_Screen = ({ navigation, route }) => {
  const { subject } = route.params;
  return (
    <ScrollView
      style={{ width: "100%", backgroundColor: "#1C385D" }}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {subject === "Slovenský Jazyk" && (
        <>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "SJL_Literatura",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Literatura
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            > 
              Literárne Druhy • Literárne Obdobia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "SJL_Gramatika",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Gramatika
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            >
              Slovné Druhy • Pravopis
            </Text>
          </TouchableOpacity>
        </>
      )}
      {subject === "Anglický Jazyk" && (
        <>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "ANJ_Vocabulary",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Slovná zásoba
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            >
              Idioms • Food • Family
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "ANJ_Tvorenie_Slov",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Tvorenie Slov
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            >
              Antonymá • Negácie
            </Text>
          </TouchableOpacity>
        </>
      )}
      {subject === "Matematika" && (
        <>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "Rímske čísla",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Rímske čísla
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            >
              Rímske čísla
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.theBox}
            onPress={() =>
              navigation.navigate("Tests", {
                subject: subject,
                topic: "Štatistika",
              })
            }
          >
            <Text
              style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}
            >
              Štatistika
            </Text>
            <Text
              style={{ fontSize: 15, fontWeight: "bold", color: "#808080" }}
            >
              Štatistika
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const Tests_Screen = ({ navigation, route }) => {
  const { subject, topic } = route.params;
  const headings = Object.keys(questions[subject][topic]);
  return (
    <ScrollView
      style={{ width: "100%", backgroundColor: "#1C385D" }}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {headings.map((test, testID) => (
        <View style={styles.theBox} key={testID}>
          <Text style={{ fontSize: 30, fontWeight: "bold", color: "#000000" }}>
            {test}
          </Text>
          <View style={{ flexDirection: "row", marginTop: "5%" }}>
            <TouchableOpacity
              style={styles.teoriaButton}
              onPress={() =>
                navigation.navigate("Teoria", {
                  subject: subject,
                  topic: topic,
                  test: test,
                })
              }
            >
              <Text style={[styles.buttonText, { color: "black" }]}>
                Teoria
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() =>
                navigation.navigate("Quiz", {
                  subject: subject,
                  topic: topic,
                  test: test,
                })
              }
            >
              <Text style={[styles.buttonText, { color: "black" }]}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const Teoria_Screen = ({ navigation, route }) => {
  const { subject, topic, test } = route.params;

  return (
    <ScrollView
      style={{ width: "100%", backgroundColor: "#1C385D" }}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <Text style={{color: "gray"}}>
        {teoria[subject][topic][test]["obsah"]}
      </Text>

    </ScrollView>
  );
};

const Quiz_Screen = ({ navigation, route }) => {
  const { subject, topic, test } = route.params;
  const quiz = questions[subject][topic][test];
  const totalQuestions = quiz.length;
  const [quizEnd, setQuizEnd] = React.useState(false);
  const [canClick, setCanClick] = React.useState(true);
  // Answers the user has picked -- filled with -1 at the start so that we know if the user has picked an answer, if an answer is picked, that index will be changed to answerIndex, if no answer is picked, it will stay -1
  
  const [selectedAnswerIndices, setSelectedAnswerIndices] = React.useState(
    Array(totalQuestions).fill(-1)
  );

  const handlePress = (questionIndex, answerIndex) => {
    if (canClick) {
      const newSelectedAnswerIndices = [...selectedAnswerIndices];
      newSelectedAnswerIndices[questionIndex] = answerIndex;
      setSelectedAnswerIndices(newSelectedAnswerIndices);
    }
  };

  const finishQuiz = () => {
    const answeredQuestions = selectedAnswerIndices.filter(
      (index) => index !== -1
    );
    if (answeredQuestions.length !== totalQuestions) {
      // Display an alert if a question hasn't been answered
      alert(
        "Not all questions answered",
        "Please answer all questions before finishing the quiz.",
        [{ text: "OK" }]
      );
    } else {
      setQuizEnd(true);
      setCanClick(false);
      increment_completed_tests();
      let tempScore = 0;
      selectedAnswerIndices.forEach((selectedIndex, questionIndex) => {
        if (selectedIndex !== -1) {
          if (quiz[questionIndex]["answers"][selectedIndex]["value"] === 1) {
            tempScore += 1;
          }
        }
      });
      Alert.alert(
        "Koniec Testu",
        "Vaše skóre: " + tempScore + "/" + totalQuestions,
        [{ text: "OK" }]
      );
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        quizEnd ? (
          <Ionicons
            onPress={() => navigation.navigate("Home")}
            name="ios-home"
            size={40}
            color="white"
          />
        ) : (
          <TouchableOpacity
            style={[styles.headerButtonContainer, { backgroundColor: "red" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerButtonText}>Zrušiť Test</Text>
          </TouchableOpacity>
        ),
      headerRight: () =>
        quizEnd ? null : (
          <TouchableOpacity
            style={styles.headerButtonContainer}
            onPress={() => finishQuiz()}
          >
            <Text style={styles.headerButtonText}>Ukončiť Test</Text>
          </TouchableOpacity>
        ),
    });
  }, [quizEnd, finishQuiz]);

  return (
    <Swiper activeDotColor="white" showsButtons={false} loop={false}>
      {/* creates a new swiper page for every question */}
      {quiz.map((question, questionIndex) => (
        <View style={styles.container} key={questionIndex}>
          <View style={styles.quizQuestionContainer}>
            <Text style={styles.quizQuestionSubText}>
              Otázka číslo {questionIndex + 1}
            </Text>
            <Text style={styles.quizQuestionText}>{question.questionText}</Text>
          </View>
          <View
            style={{
              width: "100%",
              marginTop: "20%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* creates a touchable opacity for every answer */}
            {question["answers"].map((answer, answerIndex) => (
              <TouchableOpacity
                style={[
                  styles.buttonContainer, {height: 65},
                  // if the correct answer is picked, turn the backgrouund color green
                  quizEnd && answer.value === 1
                    ? { backgroundColor: "green" }
                    : // if the wrong answer is picked, turn background color red (the correct answer will change to green)
                    quizEnd &&
                      selectedAnswerIndices[questionIndex] === answerIndex &&
                      answer.value !== 1
                    ? { backgroundColor: "red" }
                    : // when a touchable opacity is pressed, visually show that it has been clicked
                    selectedAnswerIndices[questionIndex] === answerIndex
                    ? [styles.selectedButton, { transform: [{ scale: 1.2 }] }]
                    : null,
                ]}
                key={answer.label}
                onPress={() => {
                  handlePress(questionIndex, answerIndex);
                }}
              >
                <Text style={{fontSize: 16, color: "#000000", fontWeight: "normal", alignSelf: "center", textAlign: "center", opacity: 1}}>{answer.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </Swiper>
  );
};

const About_Screen = () => {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          position: "relative",
          marginTop: 80,
        }}
      >
        <Ionicons
          onPress={() =>
            Linking.openURL("https://www.instagram.com/sos_it_bb/")
          }
          style={{ marginLeft: 20, marginRight: 20 }}
          name="logo-instagram"
          size={50}
          color="white"
        />
        <Ionicons
          onPress={() => Linking.openURL("https://www.sos-it.sk/")}
          style={{ marginLeft: 20, marginRight: 20 }}
          name="globe-outline"
          size={50}
          color="white"
        />
        <Ionicons
          onPress={() => Linking.openURL("https://www.facebook.com/sositbb/")}
          style={{ marginLeft: 20, marginRight: 20 }}
          name="logo-facebook"
          size={50}
          color="white"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C385D",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  buttonContainer: {
    backgroundColor: "#ffffff",
    width: "60%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 10,
    height: 60,
    borderRadius: 10,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
    justifyContent: "center",
    marginBottom: 20,
  },
  theBox: {
    width: "90%",
    height: 130,
    marginRight: "5%",
    marginLeft: "5%",
    marginTop: "10%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
    justifyContent: "center",
    alignItems: "center",
    opacity: 1.0,
  },
  buttonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
    textAlign: "center",
    opacity: 1,
  },
  topicsRow: {
    flexDirection: "row",
  },
  teoriaButton: {
    backgroundColor: "gray",
    width: "35%",
    height: 40,
    marginRight: 20,
    justifyContent: "center",
    borderRadius: 10,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
  },
  testButton: {
    backgroundColor: "lightgreen",
    width: "35%",
    height: 40,
    justifyContent: "center",
    borderRadius: 10,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
  },
  headerButtonContainer: {
    backgroundColor: "darkgreen",
    borderRadius: 10,
    padding: 10,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  quizQuestionContainer: {
    width: "90%",
    height: "25%",
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: "black",
    position: "relative",
    justifyContent: "center",
    shadowOffset: { width: 10, height: 10 },
    shadowColor: "black",
    shadowOpacity: 1.0,
  },
  quizQuestionText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  quizQuestionSubText: {
    fontSize: 14,
    alignSelf: "center",
    position: "absolute",
    top: 40,
  },
  selectedButton: {
    backgroundColor: "#0391DB",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
});

export default App;
