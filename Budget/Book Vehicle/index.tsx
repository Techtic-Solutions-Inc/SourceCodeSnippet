import CheckBox from "@react-native-community/checkbox";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Image, Platform, SafeAreaView, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FastImage from "react-native-fast-image";

import { FontFamily } from "../../../common/AssetUtils";
import { GlobalState, emitter } from "../../../common/GlobalState";
import { convertTime12to24, showErrorMessage } from "../../../common/Helper";
import { Keys, readString } from "../../../common/Storage";
import { Strings } from "../../../common/Strings";
import { isTextNotEmpty } from "../../../common/Validation";
import theme from "../../../common/theme";
import CustomButton from "../../../component/Button";
import Header from "../../../component/Header";
import CustomInput from "../../../component/Input";
import Loader from "../../../component/Loader/Loader";
import LocationSelection from "../../../component/LocationSelection";
import CustomText from "../../../component/Text";
import TextWithImage from "../../../component/TextWithImage";
import { RootTabScreenProps, Routes } from "../../../routes/types";
import {
  getLocationAPI,
  getRates,
  ourLocationListAPI,
} from "../../../services/mainApis";
import { BookVehicleStyle as Styles } from "./styles";
import {
  DATE_FORMAT_2,
  DATE_FORMAT_4,
  TIME_FORMAT_1,
} from "../../../services/constants";
import { UserImagesContext } from "../../../hooks/useImagesContext";

const BookVehicle = ({
  navigation,
  route,
}: RootTabScreenProps<Routes.BookVehicle>) => {
  const [location, setLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<any>("");
  const [pickupTime, setPickupTime] = useState<any>("");
  const [checkPickUpLoc, setCheckPickUpLoc] = useState(true);
  const [returnDate, setReturnDate] = useState<any>("");
  const [returnTime, setReturnTime] = useState<any>("");
  const [rentalDealCode, setRentalDealCode] = useState("");
  const [fastBreakNumber, setFastBreakNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [pickupLocationModal, setPickupLocationModal] = useState(false);
  const [returnLocationModal, setReturnLocationModal] = useState(false);
  const [guestUser, setGuestUser] = useState(GlobalState.isHome);
  emitter.on("is-location", setGuestUser);
  const { images }: any = useContext(UserImagesContext);

  const vehicleData = route?.params?.data;

  useEffect(() => {
    navigation.addListener("focus", async () => {
      getLocationAPICall();
      if (guestUser == false) {
        const GetUserData = await readString(Keys.USER_DATA);
        if (GetUserData) {
          setLastName(JSON.parse(GetUserData)?.LastName);
        }
      }
      const pickupDate = moment().add(1, "days").format(DATE_FORMAT_4);
      const returnDate = moment().add(2, "days").format(DATE_FORMAT_4);
      setPickupDate(pickupDate);
      setReturnDate(returnDate);
      const currentTime = "12:00 pm";
      setPickupTime(currentTime);
      setReturnTime(currentTime);
    });
  }, [navigation]);

  const getLocationAPICall = async () => {
    setLoading(true);
    const GetLocation = await readString(Keys.LOCATION);
    if (GetLocation) {
      setLocation("");
      setReturnLocation("");
    }
    ourLocationListAPI()
      .then((res: any) => {
        setLoading(false);
        if (res?.length > 0) {
          setLocationList(res);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error?.response) {
          console.log("error:", JSON.stringify(error.response));
        } else {
          console.log("error:", error.message);
        }
      });
  };

  const onContinue = () => {
    if (!isTextNotEmpty(location)) {
      showErrorMessage(Strings.empty_pickup_location);
    } else if (pickupDate == "") {
      showErrorMessage(Strings.empty_pickup_date);
    } else if (pickupTime == "") {
      showErrorMessage(Strings.empty_pickup_time);
    } else if (!checkPickUpLoc && !isTextNotEmpty(returnLocation)) {
      showErrorMessage(Strings.empty_return_location);
    } else if (returnDate == "") {
      showErrorMessage(Strings.empty_return_date);
    } else if (returnTime == "") {
      showErrorMessage(Strings.empty_return_time);
    } else {
      getRateAPI();
    }
  };

  const getRateAPI = async () => {
    setLoading(true);
    const GetCmp = await readString(Keys.LOCATION_CODE);
    const PickupLocationCode = locationList.filter(function (item: any) {
      return item.title == location;
    });
    const ReturnLocationCode = locationList.filter(function (item: any) {
      return item.title == returnLocation;
    });
    getRates(
      moment(pickupDate, DATE_FORMAT_4).format(DATE_FORMAT_2) +
        " " +
        convertTime12to24(pickupTime),
      PickupLocationCode[0]?.acf?.location_LocCode,
      moment(returnDate, DATE_FORMAT_4).format(DATE_FORMAT_2) +
        " " +
        convertTime12to24(returnTime),
      checkPickUpLoc
        ? PickupLocationCode[0]?.acf?.location_LocCode
        : ReturnLocationCode[0]?.acf?.location_LocCode,
      vehicleData?.acf?.vehicle_type == "car" ? "Cars" : "Trucks",
      rentalDealCode,
      fastBreakNumber,
      lastName,
      GetCmp ?? ""
    )
      .then((res: any) => {
        setLoading(false);
        var arr: any[] = [];
        Object.entries(res?.Class).map(([key, value], index) => {
          if (value.Avail) {
            arr.push(value);
          }
        });
        getOurVehicleList(arr, res?.QuoteNum, res?.LOR, res?.BCN?.Name);
      })
      .catch((error) => {
        console.log("error.response" + JSON.stringify(error.response));
        if (error.response.data?.statusCode == 500) {
          showErrorMessage(error.response.data?.error?.type);
        } else {
          showErrorMessage(error?.response?.data);
        }
        setLoading(false);
      });
  };

  const getOurVehicleList = (
    arr: any,
    QuoteNum: string,
    LOR: string,
    BCN: string
  ) => {
    var arr2 = [];
    arr.map((item: any) => {
      if (vehicleData?.acf?.vehicle_VehClass == item?.VehClass) {
        arr2.push({ ...item, ...vehicleData });
      }
    });
    if (arr2 && arr2.length > 0) {
      navigation.navigate(Routes.EquipmentAndServices, {
        item: arr2[0],
        pickupLocationDate: {
          pickupDate: pickupDate,
          pickupLocation: location,
        },
        returnLocationDate: {
          returnDate: returnDate,
          returnLocation: checkPickUpLoc ? location : returnLocation,
        },
        isAllVehicle: true,
        QuoteNum: QuoteNum,
        LOR: LOR,
        BCN: BCN,
      });
    } else {
      showErrorMessage(Strings.vehicle_not_available);
    }
  };

  return (
    <SafeAreaView style={Styles.safeAreaContainer}>
      <View style={Styles.container}>
        <Header
          isBack
          title={Strings.Book_Vehicle}
          onBackPress={() => navigation.goBack()}
        />
        <View style={Styles.subContainer}>
          <KeyboardAwareScrollView
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bounces={false}
          >
            <TextWithImage
              mainStyle={Styles.locationStyle}
              parentViewMarginTop={10}
              title={location ? location : Strings.Select_Pickup_Location}
              textColor={location ? theme.text.title : theme.text.light}
              textSize={"14"}
              fontWeight={"400"}
              fontFamily={FontFamily.NunitoSansRegular}
              imageResource={
                <FastImage
                  source={{ uri: images.down }}
                  style={{ height: 24, width: 24 }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              }
              onPress={() => {
                setPickupLocationModal(true);
              }}
            />
            <View style={Styles.rowContainer}>
              <TextWithImage
                mainStyle={Styles.pickupDateStyle}
                parentViewMarginTop={15}
                title={pickupDate ? pickupDate : Strings.Pickup_Date}
                textColor={pickupDate ? theme.text.title : theme.text.light}
                textSize={"14"}
                fontWeight={"400"}
                fontFamily={FontFamily.NunitoSansRegular}
                imageResource={
                  <Image
                    source={{ uri: images.calendar_day }}
                    style={{
                      height: 24,
                      width: 24,
                      tintColor: theme.text.light,
                    }}
                    resizeMode={"contain"}
                  />
                }
                onConfirm={(date: any) => {
                  const pickupDate = moment(date).format(DATE_FORMAT_4);
                  const returnDate = moment(date)
                    .add(1, "days")
                    .format(DATE_FORMAT_4);
                  setPickupDate(pickupDate);
                  setReturnDate(returnDate);
                }}
                minimumDate={true}
                value={pickupDate}
              />
              <TextWithImage
                mainStyle={Styles.pickupTimeStyle}
                minuteInterval={15}
                parentViewMarginTop={15}
                title={pickupTime ? pickupTime : Strings.Pickup_Time}
                textColor={pickupTime ? theme.text.title : theme.text.light}
                textSize={"14"}
                fontWeight={"400"}
                imageResource={
                  <FastImage
                    source={{ uri: images.clock }}
                    style={{ height: 24, width: 24 }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                }
                fontFamily={FontFamily.NunitoSansRegular}
                onConfirm={(date: any) => {
                  setPickupTime(moment(date).format(TIME_FORMAT_1));
                }}
                isTimeMode={true}
                value={pickupTime}
              />
            </View>
            <View style={Styles.checkboxContainer}>
              <CheckBox
                boxType={"square"}
                disabled={false}
                value={checkPickUpLoc}
                onValueChange={(newValue) => setCheckPickUpLoc(newValue)}
                onFillColor={theme.white}
                onCheckColor={theme.app.primary}
                onTintColor={theme.app.primary}
                tintColor={theme.borderInput}
                tintColors={{
                  true: theme.app.primary,
                  false: theme.borderInput,
                }}
                style={{
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.7 }, { scaleY: 0.7 }]
                      : [{ scaleX: 1.0 }, { scaleY: 1.0 }],
                  marginTop: Platform.OS == "ios" ? 6 : 0,
                }}
              />
              <CustomText
                title={Strings.The_Return_Location_the_same_Pickup_Location}
                textColor={theme.black}
                fontSize="12"
                fontWeight="400"
                fontFamily={FontFamily.NunitoSansRegular}
              />
            </View>
            {!checkPickUpLoc && (
              <TextWithImage
                mainStyle={Styles.locationStyle}
                parentViewMarginTop={10}
                title={
                  returnLocation
                    ? returnLocation
                    : Strings.Select_Return_Location
                }
                textColor={returnLocation ? theme.text.title : theme.text.light}
                textSize={"14"}
                fontWeight={"400"}
                fontFamily={FontFamily.NunitoSansRegular}
                imageResource={
                  <FastImage
                    source={{ uri: images.down }}
                    style={{ height: 24, width: 24 }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                }
                onPress={() => {
                  setReturnLocationModal(true);
                }}
              />
            )}
            <View style={Styles.rowContainer}>
              <TextWithImage
                mainStyle={Styles.pickupDateStyle}
                parentViewMarginTop={15}
                title={returnDate ? returnDate : Strings.Return_Date}
                textColor={returnDate ? theme.text.title : theme.text.light}
                textSize={"14"}
                fontWeight={"400"}
                fontFamily={FontFamily.NunitoSansRegular}
                imageResource={
                  <Image
                    source={{ uri: images.calendar_day }}
                    style={{
                      height: 24,
                      width: 24,
                      tintColor: theme.text.light,
                    }}
                    resizeMode={"contain"}
                  />
                }
                onConfirm={(date: any) => {
                  setReturnDate(moment(date).format(DATE_FORMAT_4));
                }}
                minimumDate={true}
                value={returnDate}
              />
              <TextWithImage
                mainStyle={Styles.pickupTimeStyle}
                minuteInterval={15}
                parentViewMarginTop={15}
                title={returnTime ? returnTime : Strings.Return_Time}
                textColor={returnTime ? theme.text.title : theme.text.light}
                textSize={"14"}
                fontWeight={"400"}
                fontFamily={FontFamily.NunitoSansRegular}
                imageResource={
                  <FastImage
                    source={{ uri: images.clock }}
                    style={{ height: 24, width: 24 }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                }
                onConfirm={(date: any) => {
                  setReturnTime(moment(date).format(TIME_FORMAT_1));
                }}
                isTimeMode={true}
                value={returnTime}
              />
            </View>
            <CustomText
              title={Strings.Discount_Options}
              textColor={theme.app.secondary}
              fontSize="14"
              fontWeight="700"
              marginTop="20"
              fontFamily={FontFamily.NunitoSansBold}
            />
            <CustomInput
              value={rentalDealCode}
              onChangeText={setRentalDealCode}
              placeholder={Strings.Rental_Deal_Code}
              textInputStyle={{ marginTop: 15 }}
            />
            <CustomInput
              value={fastBreakNumber}
              onChangeText={setFastBreakNumber}
              placeholder={Strings.Fastbreak_Number}
              textInputStyle={{ marginTop: 10 }}
              keyboardType={"phone-pad"}
              returnKeyType="done"
            />
            <CustomInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={Strings.Last_Name}
              textInputStyle={Styles.lastNameStyle}
            />
          </KeyboardAwareScrollView>
          <CustomButton
            title={Strings.Continue}
            borderRadius={10}
            backgroundColor={theme.app.primary}
            textColor={theme.white}
            fontSize="18"
            fontWeight="700"
            fontFamily={FontFamily.NunitoSansBold}
            onPress={onContinue}
            paddingVertical={"0"}
            customStyle={Styles.buttonStyle}
            marginTop="10"
            marginBottom="25"
          />
        </View>
      </View>
      <LocationSelection
        navigation={navigation}
        modalVisible={pickupLocationModal}
        locationData={locationList}
        title={"Select Pickup Location"}
        onClose={() => {
          setPickupLocationModal(false);
        }}
        onSelectedLocation={(location) => {
          setLocation(location);
        }}
      />
      <LocationSelection
        navigation={navigation}
        modalVisible={returnLocationModal}
        locationData={locationList}
        title={"Select Return Location"}
        onClose={() => {
          setReturnLocationModal(false);
        }}
        onSelectedLocation={(location) => {
          setReturnLocation(location);
        }}
      />
      <Loader isVisible={loading} />
    </SafeAreaView>
  );
};

export default BookVehicle;
