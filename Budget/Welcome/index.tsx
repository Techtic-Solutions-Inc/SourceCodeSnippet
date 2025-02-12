import React, { useContext, useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";

import { ActiveOpacity, FontFamily } from "../../../common/AssetUtils";
import { setIsHome } from "../../../common/GlobalState";
import { Keys, readString } from "../../../common/Storage";
import { Strings } from "../../../common/Strings";
import theme from "../../../common/theme";
import CustomButton from "../../../component/Button";
import Loader from "../../../component/Loader/Loader";
import CustomText from "../../../component/Text";
import { UserImagesContext } from "../../../hooks/useImagesContext";
import { AuthStackScreenProps, Routes } from "../../../routes/types";
import { locationData } from "../../../services/data";
import styles from "./styles";
import { scale, verticalScale } from "../../../pixelRatio";

const Welcome = ({ navigation }: AuthStackScreenProps<Routes.Login> | any) => {
  const [preferredLocation, setPreferredLocation] = useState("Budget Atlanta");
  const [location, setLocation] = useState("Atlanta");
  const [imageLoader, setImageLoader] = useState(false);
  const { images }: any = useContext(UserImagesContext);

  useEffect(() => {
    navigation.addListener("focus", async () => {
      const GetLocation = await readString(Keys.LOCATION);
      const LocationSelectedData = locationData.filter(function (item) {
        return item.name == GetLocation;
      });
      setPreferredLocation(LocationSelectedData[0].value);
      setLocation(LocationSelectedData[0].name);
    });
  }, [navigation]);

  const onGuest = () => {
    setIsHome(true, true);
  };
  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        barStyle={"light-content"}
        backgroundColor={"transparent"}
      />
      <FastImage
        source={{ uri: images?.welcome_back_screen }}
        style={[styles.imageBackground]}
        resizeMode={FastImage.resizeMode.stretch}
        onLoadStart={() => {
          setImageLoader(true);
        }}
        onLoadEnd={() => {
          setTimeout(() => {
            setImageLoader(false);
          }, 2000);
        }}
      >
        <View style={styles.topTextStyle}>
          <Text style={styles.welcomeTextStyle}>{Strings.Welcome_To}</Text>
          <Text style={styles.appNameStyle}>{preferredLocation}</Text>
          <Text style={styles.subTextStyle}>
            {`Budget Car and Truck Rental of ${location} is an Independent Licensee of Budget Rent A Car System, Inc.`}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        >
          <FastImage
            source={{ uri: images?.welcome_car }}
            style={{ height: verticalScale(190), width: scale(350) }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </FastImage>
      <View style={styles.buttonViewStyle}>
        <CustomButton
          title={Strings.Sign_In}
          borderRadius={10}
          textColor={theme.white}
          onPress={() => navigation.navigate(Routes.Login)}
          marginTop="10"
          paddingVertical={"0"}
          customStyle={{ height: 56, alignItems: "center" }}
        />
        <CustomButton
          title={Strings.Create_Account}
          borderRadius={10}
          backgroundColor={theme.white}
          textColor={theme.app.primary}
          onPress={() => navigation.navigate(Routes.SignUp)}
          marginTop="20"
          borderWidth={1}
          borderColor={theme.app.primary}
          paddingVertical={"0"}
          customStyle={{ height: 56, alignItems: "center" }}
        />
        <TouchableOpacity
          activeOpacity={ActiveOpacity}
          style={styles.skipView}
          onPress={onGuest}
        >
          <CustomText
            title={Strings.Skip}
            textColor={theme.black}
            fontSize="16"
            fontWeight="400"
            fontFamily={FontFamily.NunitoSansRegular}
            marginEnd="5"
          />
          <FastImage
            source={{ uri: images?.Next_Arrow }}
            style={{ height: 24, width: 24 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      </View>
      <Loader isVisible={imageLoader} />
    </View>
  );
};

export default Welcome;
