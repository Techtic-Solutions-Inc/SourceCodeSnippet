import { appleAuth } from "@invertase/react-native-apple-authentication";
import messaging from "@react-native-firebase/messaging";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { AccessToken, LoginManager, Profile } from "react-native-fbsdk-next";
import jwt_decode from "jwt-decode";

import { images } from "../../../../assets/images";
import { FontFamily } from "../../../common/AssetUtils";
import { setIsAuthenticated } from "../../../common/GlobalState";
import { Keys, readString, storeString } from "../../../common/Storage";
import { isTextNotEmpty, validateEmail } from "../../../common/Validation";
import { showErrorMessage } from "../../../common/helper";
import theme from "../../../common/theme";
import CustomBackground from "../../../components/Background";
import CustomButton from "../../../components/Button";
import CustomInput from "../../../components/Input";
import Loader from "../../../components/Loader/Loader";
import CustomText from "../../../components/Text";
import { UserContext } from "../../../hooks/useLanguageContext";
import { verticalScale } from "../../../pixelRatio";
import { RootTabScreenProps, Routes } from "../../../routes/types";
import {
  APPLE,
  FACEBOOK,
  GOOGLE,
  SUCCESS_CODE,
  WEB_CLIENT_ID,
} from "../../../services/apis";
import { LoginResponse } from "../../../services/dataTypes";
import {
  getLanguageString,
  getProfileAPI,
  interactionLoginStatusAPI,
  loginAPI,
  resendOtpAPI,
  socialMediaLogin,
} from "../../../services/rootApis";
import styles from "./styles";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
});

const Login = ({ navigation }: RootTabScreenProps<Routes.Login>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceToken, setDeviceToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ref_password = useRef<any>(null);
  const ref_email = useRef<any>(null);
  const { lang, setLang }: any = useContext(UserContext);

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

  const profileAPICall = async (res: any) => {
    setIsLoading(true);
    await getProfileAPI(res?.data?.response?.user_id)
      .then(async (response) => {
        setIsLoading(false);
        if (response?.statusCode === SUCCESS_CODE) {
          await storeString(
            Keys.CURRENCY,
            res.data?.response?.currency
              ? res.data?.response?.currency
              : lang?.CHF
          );
          await storeString(Keys.USER_DATA, JSON.stringify(response?.data));
          getLanguageString(res?.data?.response?.user_id)
            .then(async (res: any) => {
              if (Number(res?.statusCode) === SUCCESS_CODE) {
                setLang(res?.data[0]?.languageStrings);
                await setIsAuthenticated(true, true);
                navigation.replace(Routes.Home);
              }
            })
            .catch((error) => {
              setIsLoading(false);
              console.log("ERROR ==>", error);
              showErrorMessage(error?.response?.data?.message);
            });
        }
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const loginInteractionAPICall = async () => {
    setIsLoading(true);
    await interactionLoginStatusAPI()
      .then(async (response) => {
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

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
    } else {
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceVersion = await DeviceInfo.getSystemVersion();
      const deviceUniqueID = await DeviceInfo.getUniqueId();
      const token = await messaging().getToken();
      await storeString(Keys.DEVICE_TOKEN, token);

      setIsLoading(true);
      loginAPI(
        email,
        password,
        deviceToken ? deviceToken : token,
        Platform.OS,
        deviceName,
        deviceVersion,
        deviceUniqueID
      )
        .then(async (res: LoginResponse) => {
          setIsLoading(false);
          await storeString(Keys.TOKEN, res?.data?.user_token);
          if (
            res.data?.response?.is_t_and_c_checked == false ||
            res.data?.response?.is_privacy_policy_checked == false
          ) {
            navigation.navigate(Routes.TnCScreen, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Login",
              res: res,
            });
          } else if (res.data?.response?.is_email_verified == false) {
            setIsLoading(true);
            resendOtpAPI(email)
              .then(async (otpRes: any) => {
                setIsLoading(false);
                if (otpRes?.statusCode === SUCCESS_CODE) {
                  navigation.navigate(Routes.VerificationCode, {
                    email: email,
                    description: lang?.Please_enter_the_code_register,
                    screenName: "Login",
                    res: res,
                  });
                }
              })
              .catch((error) => {
                setIsLoading(false);
                showErrorMessage(
                  error?.response?.data?.message ?? lang?.Something_went_wrong
                );
                console.log("error----", error?.response?.data?.message);
              });
          } else {
            profileAPICall(res);
            loginInteractionAPICall();
          }
        })
        .catch((error) => {
          console.log("error", JSON.stringify(error));
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  };

  async function onGoogleButtonPress() {
    // const isSignedIn = await GoogleSignin.isSignedIn();
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceVersion = await DeviceInfo.getSystemVersion();
      const deviceUniqueID = await DeviceInfo.getUniqueId();
      const token = await messaging().getToken();
      await storeString(Keys.DEVICE_TOKEN, token);

      if (userInfo.user) {
        setIsLoading(true);
        socialMediaLogin(
          userInfo?.user?.email,
          userInfo?.user?.givenName,
          userInfo?.user?.familyName,
          GOOGLE,
          userInfo?.user?.id,
          deviceToken ? deviceToken : token,
          Platform.OS,
          deviceName,
          deviceVersion,
          deviceUniqueID
        )
          .then(async (res: any) => {
            setIsLoading(false);
            await storeString(Keys.TOKEN, res?.data?.user_token);
            if (res.data?.response?.is_filled_profile == false) {
              navigation.navigate(Routes.AddSocialUserInfo, {
                email: email,
                description: lang?.Please_enter_the_code_register,
                screenName: "Login",
                res: res,
              });
            } else if (
              res.data?.response?.is_t_and_c_checked == false ||
              res.data?.response?.is_privacy_policy_checked == false
            ) {
              navigation.navigate(Routes.TnCScreen, {
                email: email,
                description: lang?.Please_enter_the_code_register,
                screenName: "Login",
                res: res,
              });
            } else if (
              res.data?.response?.is_filled_profile == true &&
              res.data?.response?.is_t_and_c_checked == true &&
              res.data?.response?.is_privacy_policy_checked == true
            ) {
              profileAPICall(res);
              loginInteractionAPICall();
            } else {
              showErrorMessage(lang?.Something_went_wrong);
            }
          })
          .catch((error) => {
            console.log("error", JSON.stringify(error));
            setIsLoading(false);
            showErrorMessage(
              error?.response?.data?.message ?? lang?.Something_went_wrong
            );
          });
      }
    } catch (error: any) {
      console.log("error : ", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  }

  async function onAppleButtonPress() {
    const appleAuthRequestResponse: any = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
    const appleTokenRes = jwt_decode(appleAuthRequestResponse.identityToken);
    const appleEmail = appleTokenRes?.email;
    const privateEmail = appleTokenRes?.is_private_email;

    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );
    if (credentialState === appleAuth.State.AUTHORIZED) {
      if (appleAuthRequestResponse.email) {
        await storeString(Keys.APPLE_EMAIL, appleAuthRequestResponse.email);
      }
      if (appleAuthRequestResponse?.fullName?.givenName) {
        await storeString(
          Keys.APPLE_USER_FIRST_NAME,
          appleAuthRequestResponse?.fullName.givenName
        );
      }
      if (appleAuthRequestResponse?.fullName?.familyName) {
        await storeString(
          Keys.APPLE_USER_LAST_NAME,
          appleAuthRequestResponse.fullName.familyName
        );
      }
      const userFirstName = await readString(Keys.APPLE_USER_FIRST_NAME);
      const userLastName = await readString(Keys.APPLE_USER_LAST_NAME);
      const userEmail = await readString(Keys.APPLE_EMAIL);

      const deviceName = await DeviceInfo.getDeviceName();
      const deviceVersion = await DeviceInfo.getSystemVersion();
      const deviceUniqueID = await DeviceInfo.getUniqueId();
      const token = await messaging().getToken();
      await storeString(Keys.DEVICE_TOKEN, token);

      setIsLoading(true);
      socialMediaLogin(
        appleAuthRequestResponse.email
          ? appleAuthRequestResponse.email
          : userEmail
          ? userEmail
          : appleEmail
          ? appleEmail
          : privateEmail,
        appleAuthRequestResponse?.fullName?.givenName
          ? appleAuthRequestResponse.fullName.givenName
          : userFirstName,
        appleAuthRequestResponse?.fullName?.familyName
          ? appleAuthRequestResponse.fullName.familyName
          : userLastName,
        APPLE,
        appleAuthRequestResponse?.user,
        deviceToken ? deviceToken : token,
        Platform.OS,
        deviceName,
        deviceVersion,
        deviceUniqueID
      )
        .then(async (res: any) => {
          setIsLoading(false);
          await storeString(Keys.TOKEN, res?.data?.user_token);
          if (res.data?.response?.is_filled_profile === false) {
            navigation.navigate(Routes.AddSocialUserInfo, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Login",
              res: res,
            });
          } else if (
            res.data?.response?.is_t_and_c_checked == false ||
            res.data?.response?.is_privacy_policy_checked == false
          ) {
            navigation.navigate(Routes.TnCScreen, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Login",
              res: res,
            });
          } else if (
            res.data?.response?.is_filled_profile == true &&
            res.data?.response?.is_t_and_c_checked == true &&
            res.data?.response?.is_privacy_policy_checked == true
          ) {
            profileAPICall(res);
            loginInteractionAPICall();
          } else {
            showErrorMessage(lang?.Something_went_wrong);
          }
        })
        .catch((error) => {
          console.log("error", JSON.stringify(error));
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  }

  const onFacebookButtonPress = async () => {
    const facebookData = await callFacebookLogin();
    if (facebookData) {
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceVersion = await DeviceInfo.getSystemVersion();
      const deviceUniqueID = await DeviceInfo.getUniqueId();
      const token = await messaging().getToken();
      await storeString(Keys.DEVICE_TOKEN, token);

      const fbtoken = facebookData?.accessToken;
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${fbtoken}`
      );
      const facebookEmail = await response.json();
      setIsLoading(true);
      socialMediaLogin(
        facebookData?.data?.email
          ? facebookData?.data?.email
          : facebookEmail?.email,
        facebookData?.data?.firstName,
        facebookData?.data?.lastName,
        FACEBOOK,
        facebookData?.data?.userID,
        deviceToken ? deviceToken : token,
        Platform.OS,
        deviceName,
        deviceVersion,
        deviceUniqueID,
        facebookData?.accessToken
      )
        .then(async (res: any) => {
          setIsLoading(false);
          await storeString(Keys.TOKEN, res?.data?.user_token);
          if (res.data?.response?.is_filled_profile === false) {
            navigation.navigate(Routes.AddSocialUserInfo, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Login",
              res: res,
            });
          } else if (
            res.data?.response?.is_t_and_c_checked == false ||
            res.data?.response?.is_privacy_policy_checked == false
          ) {
            navigation.navigate(Routes.TnCScreen, {
              email: email,
              description: lang?.Please_enter_the_code_register,
              screenName: "Login",
              res: res,
            });
          } else if (
            res.data?.response?.is_filled_profile == true &&
            res.data?.response?.is_t_and_c_checked == true &&
            res.data?.response?.is_privacy_policy_checked == true
          ) {
            profileAPICall(res);
            loginInteractionAPICall();
          } else {
            showErrorMessage(lang?.Something_went_wrong);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          console.log("error", JSON.stringify(error));
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  };

  async function callFacebookLogin() {
    try {
      await LoginManager.setLoginBehavior("web_only");
      await LoginManager.logOut();
      const result = await LoginManager.logInWithPermissions([
        "email",
        "public_profile",
      ]);
      if (result.isCancelled) {
        console.log("Login cancelled");
        return;
      }
      var data: any;
      data = await AccessToken.getCurrentAccessToken();
      return await Profile.getCurrentProfile().then(function (currentProfile) {
        if (currentProfile) {
          return {
            data: currentProfile,
            accessToken: data?.accessToken,
          };
        } else {
          return null;
        }
      });
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  if (lang == undefined) {
    return (
      <CustomBackground>
        <Loader isVisible={lang == undefined} />
      </CustomBackground>
    );
  }
  return (
    <CustomBackground>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
      >
        <SafeAreaView style={styles.main}>
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Image
              style={styles.appLogoImage}
              source={images.appLogo}
              resizeMode="cover"
            />
            <CustomInput
              value={email}
              onChangeText={setEmail}
              keyboardType={"email-address"}
              autoCapitalize="none"
              placeholder={lang?.E_Mail}
              onSubmitEditing={() => {
                ref_password.current.focus();
              }}
              returnKeyType="next"
              inputContainer={{
                marginTop: verticalScale(25),
              }}
              inputRef={ref_email}
            />
            <CustomInput
              placeholder={lang?.Password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              inputContainer={{
                marginTop: verticalScale(12),
              }}
              inputRef={ref_password}
              returnKeyType="done"
            />
            <CustomButton title={lang?.Log_In} onPress={onSubmit} />
            <CustomText
              title={lang?.Forgot_Password}
              textColor={theme.darkgray}
              fontSize="20"
              fontWeight="400"
              marginTop="6%"
              fontFamily={FontFamily.InriaSansRegular}
              onPress={() =>
                navigation.navigate(Routes.ForgotPassword, {
                  isChangePassword: false,
                  recentEmailID: "",
                })
              }
              textStyle={{ alignSelf: "center" }}
            />
            <View style={styles.lineView} />
            <CustomText
              title={lang?.Register}
              textColor={theme.white}
              fontSize="30"
              fontWeight="400"
              marginTop="5%"
              marginBottom="2%"
              fontFamily={FontFamily.InriaSansRegular}
              onPress={() => navigation.navigate(Routes.SignUp)}
              textStyle={styles.textShadow}
            />
            {Platform.OS == "ios" && (
              <Pressable
                style={styles.socialLoginView}
                onPress={() => onAppleButtonPress()}
              >
                <Image
                  source={images.AppleLogo}
                  style={{ height: 25, width: 25 }}
                  resizeMode="contain"
                />
                <Text style={styles.socialLoginText}>
                  {lang?.Continue_with_Apple}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.socialLoginView, { backgroundColor: theme.white }]}
              onPress={() => onGoogleButtonPress()}
            >
              <Image
                source={images.GoogleLogo}
                style={{ height: 25, width: 25 }}
                resizeMode="contain"
              />
              <Text style={[styles.socialLoginText, { color: theme.darkgray }]}>
                {lang?.Continue_with_Google}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.socialLoginView,
                { backgroundColor: theme.lightBlue },
              ]}
              onPress={() => onFacebookButtonPress()}
            >
              <Image
                source={images.FacebookLogo}
                style={{ height: 25, width: 25 }}
                resizeMode="contain"
              />
              <Text style={styles.socialLoginText}>
                {lang?.Continue_with_Facebook}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScrollView>
      <Loader isVisible={isLoading} />
    </CustomBackground>
  );
};

export default Login;
