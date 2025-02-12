import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-snap-carousel";
import H2OIcon from "../../../assets/images/h2o-logo.svg";
import NextIcon from "../../../assets/images/next.svg";
import OnBoardingBg2 from "../../../assets/images/onboarding.png";
import Colors from "../../../assets/colors/Colors";
import { Fonts } from "../../../assets/fonts/Fonts";
import { setIsOnBoarding } from "../../core/globalState";
import { routes } from "../../navigation/routes";
import { OnBoardingData } from "../../utils/Modals";
import FastImage from "react-native-fast-image";

const { width, height } = Dimensions.get("window");
const OnBoarding = () => {
  const navigation = useNavigation();
  const [isPosition, setIsPosition] = useState(0);
  const carouselRef = useRef(null);

  const renderPage = ({ item, index }) => {
    return (
      <View key={index} style={styles.renderContainer}>
        {(index === 0 && <item.image />) ||
          (index === 1 && (
            <item.image style={styles.preferenceImage} height="300" />
          )) ||
          (index === 2 && (
            <FastImage source={item.image} style={styles.preferenceImage} />
          ))}

        <Text style={styles.choosePrefText}>{item.title}</Text>
        <Text style={styles.chooseProductText}>{item.subTitle}</Text>
      </View>
    );
  };

  const handleSnapToItem = (index) => {
    setIsPosition(index);
  };

  const goToNextPage = () => {
    if (carouselRef.current) {
      carouselRef.current.snapToNext();
    }
  };
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.app.light} />
      <ImageBackground source={OnBoardingBg2} style={styles.imageBgView} />
      <View style={styles.container}>
        <H2OIcon style={styles.h2oLogo} />
        <Carousel
          ref={carouselRef}
          data={OnBoardingData}
          renderItem={renderPage}
          sliderWidth={width}
          itemWidth={width}
          onSnapToItem={handleSnapToItem}
        />

        <View style={styles.cicleContainer}>
          <View
            style={[
              styles.cicleView,
              {
                backgroundColor:
                  isPosition === 0 ? Colors.app.secondary : Colors.inActive,
              },
            ]}
          />
          <View
            style={[
              styles.cicleView,
              {
                backgroundColor:
                  isPosition === 1 ? Colors.app.secondary : Colors.inActive,
              },
            ]}
          />
          <View
            style={[
              styles.cicleView,
              {
                backgroundColor:
                  isPosition === 2 ? Colors.app.secondary : Colors.inActive,
              },
            ]}
          />
          <View style={styles.flexView} />
          <TouchableOpacity
            onPress={() => {
              if (isPosition === 2) {
                setIsOnBoarding(true, true);
                navigation.reset({
                  index: 0,
                  routes: [{ name: routes.SignUp }],
                });
              } else {
                goToNextPage();
              }
            }}
          >
            <NextIcon />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: { flex: 1, paddingTop: 20 },
  snapImage: {
    marginTop: height * 0.09,
    alignSelf: "center",
    height: 300,
    width: "100%",
    resizeMode: "stretch",
  },
  preferenceImage: {
    marginTop: height * 0.09,
    alignSelf: "center",
    height: 300,
    width: "100%",
    // resizeMode: "stretch",
  },
  choosePrefText: {
    fontSize: 26,
    fontFamily: Fonts.PlusJakartaSansBold,
    color: Colors.text.title,
    textAlign: "center",
    marginTop: height * 0.13,
    paddingHorizontal: 10,
  },
  chooseProductText: {
    fontSize: 14,
    fontFamily: Fonts.PlusJakartaSansRegular,
    color: Colors.text.title,
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 10,
  },
  cicleContainer: {
    flexDirection: "row",
    marginStart: 10,
    marginTop: height * 0.1,
    marginEnd: 15,
    alignItems: "center",
    marginBottom: 20,
    position: "absolute",
    bottom: 0,
  },
  cicleView: {
    height: 10,
    width: 10,
    borderRadius: 50,
    marginStart: 10,
    backgroundColor: Colors.app.secondary,
  },
  renderContainer: { width: width },
  imageBgView: { width: width, height: height, position: "absolute" },
  h2oLogo: { alignSelf: "center" },
  flexView: { flex: 1 },
});

export default OnBoarding;
