import CheckBox from "@react-native-community/checkbox";
import messaging from "@react-native-firebase/messaging";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RBSheet from "react-native-raw-bottom-sheet";

import { images } from "../../../../assets/images";
import { FontFamily } from "../../../common/AssetUtils";
import { Keys, readString, storeString } from "../../../common/Storage";
import {
  isTextNotEmpty,
  validateEmail,
  validatePassword,
} from "../../../common/Validation";
import {
  capitalizeFirstLetter,
  showErrorMessage,
} from "../../../common/helper";
import theme from "../../../common/theme";
import CustomBackground from "../../../components/Background";
import DropdownView from "../../../components/DropdownView";
import CustomInput from "../../../components/Input";
import Loader from "../../../components/Loader/Loader";
import CustomText from "../../../components/Text";
import { UserContext } from "../../../hooks/useLanguageContext";
import { scale, verticalScale } from "../../../pixelRatio";
import { RootTabScreenProps, Routes } from "../../../routes/types";
import {
  DATE_FORMAT,
  DATE_FORMAT_1,
  SUCCESS_CODE,
} from "../../../services/apis";
import { SignupResponse } from "../../../services/dataTypes";
import {
  countryAndRegionList,
  getLanguageString,
  getTermsConditionAndPrivacyPolicy,
  languagesList,
  signupAPI,
} from "../../../services/rootApis";
import styles from "./styles";

const SignUp = ({ navigation }: RootTabScreenProps<Routes.SignUp>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [checkAGB, setCheckAGB] = useState(false);
  const [checkDate, setCheckDate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<any>();
  const [deviceToken, setDeviceToken] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [languageData, setLanguageData] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [countryList, setCountryList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [cityListStatic, setCityListStatic] = useState<any[]>([]);
  const [selectedCountryID, setSelectedCountryID] = useState();
  const [selectedCityID, setSelectedCityID] = useState();
  const [languageSortForm, setLanguageSortForm] = useState("");

  const { lang, setLang }: any = useContext(UserContext);
  const rbsheetRef = useRef<any>(null);
  const ref_email = useRef<any>(null);
  const ref_password = useRef<any>(null);
  const ref_cPassword = useRef<any>(null);
  const ref_firstName = useRef<any>(null);
  const ref_lastName = useRef<any>(null);

  useEffect(() => {
    navigation.addListener("focus", async () => {
      getCountryList();
      getLanguageAPICall();
    });
  }, [navigation]);

  useEffect(() => {
    termsConditionAndPrivacyPolicy();
  }, [languageSortForm]);

  useEffect(() => {
    countryList.filter((item) => {
      if (item.value == selectedCountry) {
        var arr: any[] = [];
        item?.regions.map((subItem: any) => {
          arr.push({
            label: subItem?.region_name,
            value: subItem?.region_name,
            _id: subItem?._id,
          });
        });
        setCityList(arr);
        setCityListStatic(arr);
      }
    });
  }, [selectedCountry]);

  useEffect(() => {
    if (Platform.OS == "ios") {
      requestUserPermission();
    } else {
      getDeviceToken();
    }
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      messaging()
        .hasPermission()
        .then((enabled) => {
          if (enabled) {
            getDeviceToken();
          }
        });
    }
  }

  async function getDeviceToken() {
    if (Platform.OS == "android") {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    console.log("token:", token);
    setDeviceToken(token);
    await storeString(Keys.DEVICE_TOKEN, token);
  }

  const onSubmit = async () => {
    if (!isTextNotEmpty(email)) {
      showErrorMessage(lang?.Enter_Email);
    } else if (!validateEmail(email)) {
      showErrorMessage(lang?.Valid_Email);
    } else if (!isTextNotEmpty(password)) {
      showErrorMessage(lang?.Enter_Password);
    } else if (!validatePassword(password)) {
      showErrorMessage(lang?.Valid_Password_desc);
    } else if (!isTextNotEmpty(conformPassword)) {
      showErrorMessage(lang?.Enter_Repeat_Password);
    } else if (password !== conformPassword) {
      showErrorMessage(lang?.Password_and_confirm_Mismatch);
    } else if (!isTextNotEmpty(firstName)) {
      showErrorMessage(lang?.Enter_FirstName);
    } else if (!isTextNotEmpty(lastName)) {
      showErrorMessage(lang?.Enter_LastName);
    } else if (!isTextNotEmpty(selectedCountry)) {
      showErrorMessage(lang?.Enter_Country);
    } else if (!isTextNotEmpty(selectedCity)) {
      showErrorMessage(lang?.Enter_City);
    } else if (!isTextNotEmpty(selectedLanguage)) {
      showErrorMessage(lang?.Enter_Language);
    } else if (checkAGB == false) {
      showErrorMessage(lang?.Please_Select_Conditions);
    } else if (checkDate == false) {
      showErrorMessage(lang?.Please_Select_Data);
    } else {
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceVersion = await DeviceInfo.getSystemVersion();
      const deviceUniqueID = await DeviceInfo.getUniqueId();
      const token = await messaging().getToken();
      await storeString(Keys.DEVICE_TOKEN, token);

      setIsLoading(true);
      signupAPI(
        firstName,
        lastName,
        email,
        password,
        date ? moment(date).format(DATE_FORMAT) : "",
        selectedCountryID,
        selectedCityID,
        languageSortForm ? languageSortForm : "de",
        deviceToken ? deviceToken : token,
        Platform.OS,
        deviceName,
        deviceVersion,
        deviceUniqueID
      )
        .then(async (res: SignupResponse) => {
          setIsLoading(false);
          if (res?.statusCode == SUCCESS_CODE) {
            await storeString(Keys.TOKEN, res?.data?.user_token);
            navigation.navigate(Routes.VerificationCode, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Register",
              res: res,
            });
          }
        })
        .catch((error) => {
          console.log("ERROR ===>", JSON.stringify(error));
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  };

  const getCountryList = async () => {
    setIsLoading(true);
    await countryAndRegionList()
      .then(async (response) => {
        var arr: any[] = [];
        response?.data.map((item: any) => {
          arr.push({
            label: item?.country_name,
            value: item?.country_name,
            regions: item?.regions,
            _id: item?._id,
          });
        });
        setCountryList(arr);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const termsConditionAndPrivacyPolicy = async () => {
    await getTermsConditionAndPrivacyPolicy(languageSortForm)
      .then(async (response) => {
        if (response?.statusCode === SUCCESS_CODE) {
          setData(response?.data[0]?.terms_and_conditions[0]);
        }
      })
      .catch((error) => {
        console.log("error---", error);
      });
  };

  const getLanguageAPICall = async () => {
    const getLanguageShortForm = await readString(Keys.LANGUAGE_SHORT_FORM);
    setLanguageSortForm(getLanguageShortForm);
    await languagesList()
      .then(async (response) => {
        if (response?.statusCode === SUCCESS_CODE) {
          setLanguageData(response.data);
          if (getLanguageShortForm) {
            const getLanguageName = response.data.filter((item) => {
              return item.language_short_form === getLanguageShortForm;
            });
            setSelectedLanguage(getLanguageName[0]?.language_name);
          }
        }
      })
      .catch((error) => {
        console.log("error---", error.message);
      });
  };

  const renderItem: ListRenderItem<any> = ({ item, index }) => {
    return (
      <>
        <Pressable
          onPress={() => {
            setIsLoading(true);
            getLanguageString("", item.language_short_form)
              .then(async (res: any) => {
                setIsLoading(false);
                if (res?.statusCode == SUCCESS_CODE) {
                  setLang(res?.data[0]?.languageStrings);
                  setSelectedLanguage(item.language_name);
                  setLanguageSortForm(item.language_short_form);
                  await storeString(
                    Keys.LANGUAGE_SHORT_FORM,
                    item.language_short_form
                  );
                  rbsheetRef?.current.close();
                }
              })
              .catch((error) => {
                setIsLoading(false);
                console.log("ERROR ==>", JSON.stringify(error));
                showErrorMessage(error?.response?.data?.message);
                rbsheetRef?.current.close();
              });
          }}
          style={styles.rowContainer}
        >
          <Text style={styles.languageText}>{item.language_name}</Text>
        </Pressable>
        {selectedLanguage == item.language_name && (
          <Image
            source={images.Check}
            style={styles.checkIcon}
            resizeMode="contain"
          />
        )}
        {index + 1 < languageData?.length && (
          <View style={styles.languageLineView} />
        )}
      </>
    );
  };

  return (
    <CustomBackground>
      <SafeAreaView style={styles.main}>
        <View style={styles.container}>
          <View style={{ alignItems: "center" }}>
            <CustomText
              title={lang?.appName}
              textColor={theme.white}
              fontSize="40"
              fontWeight="400"
              marginTop="15%"
              marginBottom="2%"
              fontFamily={FontFamily.InriaSansRegular}
              textStyle={styles.textShadow}
            />
          </View>
          <View
            style={[styles.lineView, { marginBottom: verticalScale(15) }]}
          />
          <KeyboardAwareScrollView
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            extraHeight={30}
            keyboardOpeningTime={0}
            enableResetScrollToCoords={false}
          >
            <View style={{ paddingHorizontal: scale(22) }}>
              <CustomInput
                value={email}
                onChangeText={setEmail}
                keyboardType={"email-address"}
                autoCapitalize="none"
                placeholder={lang?.E_Mail}
                inputContainer={{
                  marginTop: verticalScale(10),
                }}
                inputRef={ref_email}
              />
              <CustomInput
                value={password}
                onChangeText={setPassword}
                placeholder={lang?.Password}
                secureTextEntry={true}
                inputContainer={{ marginTop: verticalScale(12) }}
                inputRef={ref_password}
              />
              <CustomInput
                value={conformPassword}
                onChangeText={setConformPassword}
                placeholder={lang?.Confirm_Password}
                secureTextEntry={true}
                inputContainer={{ marginTop: verticalScale(12) }}
                inputRef={ref_cPassword}
              />
              <CustomInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder={lang?.First_Name}
                inputContainer={{ marginTop: verticalScale(12) }}
                inputRef={ref_firstName}
              />
              <CustomInput
                value={lastName}
                onChangeText={setLastName}
                placeholder={lang?.Last_Name}
                inputContainer={{ marginTop: verticalScale(12) }}
                inputRef={ref_lastName}
              />
              <Pressable
                style={styles.logoutButton}
                onPress={() => setOpen(true)}
              >
                <CustomText
                  textStyle={styles.buttonText}
                  title={
                    date ? moment(date).format(DATE_FORMAT_1) : lang?.Birthday
                  }
                  fontFamily={FontFamily.InriaSansRegular}
                />
              </Pressable>
              <DropdownView
                placeholder={lang?.Country}
                data={countryList}
                onChangeText={function (text: any): void {
                  setSelectedCountry(text);
                  setSelectedCity(null);
                  setSearchCity("");
                  const city = countryList.find((city) => city.value === text);
                  if (city) {
                    setSelectedCountryID(city?._id);
                  }
                }}
                value={selectedCountry}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 8,
                  backgroundColor: theme.theme,
                  paddingStart: scale(25),
                }}
              />
              {selectedCountry != null && (
                <DropdownView
                  placeholder={lang?.Place_of_residence}
                  searchPlaceholder={lang?.Search}
                  data={
                    searchCity == ""
                      ? cityListStatic
                      : cityList.filter(({ value }) =>
                          searchCity.length == 0
                            ? true
                            : value.includes(searchCity)
                        )
                  }
                  value={selectedCity}
                  onChangeText={(value: any) => {
                    setSelectedCity(value);
                    const city = cityList.find((city) => city.value === value);
                    if (city) {
                      setSelectedCityID(city?._id);
                    }
                    setSearchCity("");
                  }}
                  onChangeSearchText={(searchText: any) => {
                    setSearchCity(searchText);
                  }}
                  searchCity={capitalizeFirstLetter(searchCity)}
                  modal={true}
                  search={true}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 8,
                    backgroundColor: theme.theme,
                    paddingStart: scale(30),
                  }}
                  containerStyles={{ height: 450, paddingBottom: 20 }}
                />
              )}
              <Pressable
                onPress={() => [rbsheetRef?.current.open()]}
                style={styles.optionMainView}
              >
                <Text style={styles.optionTitleText}>
                  {selectedLanguage == "" ? lang?.Language : selectedLanguage}
                </Text>
              </Pressable>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                  flexWrap: "wrap",
                  display: "flex",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <CheckBox
                    boxType={"square"}
                    disabled={false}
                    value={checkAGB}
                    onValueChange={(newValue) => setCheckAGB(newValue)}
                    onFillColor={theme.white}
                    onCheckColor={theme.theme}
                    onTintColor={theme.white}
                    tintColor={theme.white}
                    tintColors={{
                      true: theme.white,
                      false: theme.white,
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
                    title={lang?.Conditions}
                    textColor={theme.white}
                    fontSize="20"
                    fontWeight="400"
                    marginStart="20"
                    marginEnd="3%"
                    fontFamily={FontFamily.InriaSansRegular}
                    onPress={() =>
                      navigation.navigate(Routes.WebViewLink, {
                        link: data?.terms_and_condition,
                      })
                    }
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <CheckBox
                    boxType={"square"}
                    disabled={false}
                    value={checkDate}
                    onValueChange={(newValue) => setCheckDate(newValue)}
                    onFillColor={theme.white}
                    onCheckColor={theme.theme}
                    onTintColor={theme.white}
                    tintColor={theme.white}
                    tintColors={{
                      true: theme.white,
                      false: theme.white,
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
                    title={lang?.Data_Protection}
                    textColor={theme.white}
                    fontSize="20"
                    fontWeight="400"
                    fontFamily={FontFamily.InriaSansRegular}
                    onPress={() =>
                      navigation.navigate(Routes.WebViewLink, {
                        link: data?.privacy_policy,
                      })
                    }
                  />
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <View style={styles.lineView} />
            <CustomText
              title={lang?.Register}
              textColor={theme.white}
              fontSize="30"
              fontWeight="400"
              marginTop="5%"
              marginBottom="2%"
              fontFamily={FontFamily.InriaSansRegular}
              onPress={() => onSubmit()}
              textStyle={styles.textShadow}
            />
            <CustomText
              title={lang?.Back}
              textColor={theme.white}
              fontSize="30"
              fontWeight="400"
              marginTop="2%"
              marginBottom="3%"
              fontFamily={FontFamily.InriaSansRegular}
              onPress={() => navigation.goBack()}
              textStyle={styles.textShadow}
            />
          </View>
          <RBSheet
            ref={rbsheetRef}
            height={verticalScale(200)}
            openDuration={250}
            customStyles={{
              container: styles.rbsheetContainerStyle,
            }}
          >
            <View>
              <FlatList
                bounces={false}
                data={languageData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </RBSheet>
          <DatePicker
            modal
            mode={"date"}
            open={open}
            maximumDate={new Date()}
            date={date ? date : new Date()}
            onConfirm={(date) => {
              setDate(date);
              setOpen(false);
            }}
            onCancel={() => {
              setOpen(false);
            }}
            cancelText={lang?.Cancel}
            confirmText={lang?.Confirm}
          />
        </View>
      </SafeAreaView>
      <Loader isVisible={isLoading} />
    </CustomBackground>
  );
};
export default SignUp;
