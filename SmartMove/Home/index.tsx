import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";
import InAppReview from "react-native-in-app-review";
import { Shadow } from "react-native-shadow-2";
import Video from "react-native-video";

import { OtherAsset, SVGImages, images } from "../../../../assets/images";
import { FontFamily } from "../../../common/AssetUtils";
import { callLogoutRedirectToLogin } from "../../../common/helper";
import theme from "../../../common/theme";
import CustomBackground from "../../../components/Background";
import CustomButton from "../../../components/Button";
import Loader from "../../../components/Loader/Loader";
import CustomText from "../../../components/Text";
import { UserContext } from "../../../hooks/useLanguageContext";
import { UserNotificationContext } from "../../../hooks/usePushNotificationCount";
import { moderateScale, scale, verticalScale } from "../../../pixelRatio";
import { RootTabScreenProps, Routes } from "../../../routes/types";
import { SUCCESS_CODE, UNAUTHORIZED_CODE } from "../../../services/apis";
import {
  getSubscriptionExpiredStatusAPI,
  languagesList,
  updateSubscriptionExpiredStatusAPI,
} from "../../../services/rootApis";
import styles from "./styles";

const Home = ({ navigation }: RootTabScreenProps<Routes.Home>) => {
  const { lang, setLang }: any = useContext(UserContext);
  const { pushNotificationCount, getPushNotificationCount }: any = useContext(
    UserNotificationContext
  );
  const [isModal, setIsModal] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.addListener("focus", async () => {
      getPushNotificationCount();
      getLanguageAPICall();
      getSubscriptionStatusAPICall();
    });
  }, [navigation]);

  const getSubscriptionStatusAPICall = async () => {
    await getSubscriptionExpiredStatusAPI()
      .then(async (response) => {
        if (response?.statusCode === SUCCESS_CODE) {
          setIsModal(response?.data?.show_modal);
        }
      })
      .catch((error) => {
        console.log("error---", error.message);
        if (error?.response?.data?.statusCode === UNAUTHORIZED_CODE) {
          callLogoutRedirectToLogin(navigation, setLang);
        }
      });
  };

  const updateSubscriptionStatusAPICall = async () => {
    await updateSubscriptionExpiredStatusAPI(false)
      .then(async (response) => {
        if (response?.statusCode === SUCCESS_CODE) {
          setIsModal(false);
        }
      })
      .catch((error) => {
        console.log("error---", error.message);
        setIsModal(false);
        if (error?.response?.data?.statusCode === UNAUTHORIZED_CODE) {
          callLogoutRedirectToLogin(navigation, setLang);
        }
      });
  };

  const ratingApp = () => {
    InAppReview.isAvailable();
    // trigger UI InAppreview
    InAppReview.RequestInAppReview()
      .then((hasFlowFinishedSuccessfully) => {
        // when return true in android it means user finished or close review flow
        console.log("InAppReview in android", hasFlowFinishedSuccessfully);
        // when return true in ios it means review flow lanuched to user.
        // 1- you have option to do something ex: (navigate Home page) (in android).
        // 2- you have option to do something,
        // ex: (save date today to lanuch InAppReview after 15 days) (in android and ios).
        // 3- another option:
        if (hasFlowFinishedSuccessfully) {
          // do something for ios
          // do something for android
        }
        // for android:
        // The flow has finished. The API does not indicate whether the user
        // reviewed or not, or even whether the review dialog was shown. Thus, no
        // matter the result, we continue our app flow.
        // for ios
        // the flow lanuched successfully, The API does not indicate whether the user
        // reviewed or not, or he/she closed flow yet as android, Thus, no
        // matter the result, we continue our app flow.
      })
      .catch((error) => {
        //we continue our app flow.
        // we have some error could happen while lanuching InAppReview,
        // Check table for errors and code number that can return in catch.
        console.log(error);
      });
  };

  const getLanguageAPICall = async () => {
    await languagesList()
      .then(async (response) => {
        if (response?.statusCode === SUCCESS_CODE) {
        }
      })
      .catch((error) => {
        console.log("error---", error.message);
        if (error?.response?.data?.statusCode === UNAUTHORIZED_CODE) {
          callLogoutRedirectToLogin(navigation, setLang);
        }
      });
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Platform.OS == "ios"
            ? "https://apps.apple.com/app/smartmove-move-smarter/id6477779179"
            : "https://play.google.com/store/apps/details?id=com.smartmove.app",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <CustomBackground>
      <View style={styles.mainContainer}>
        <Video
          source={OtherAsset?.HomeVideo}
          style={styles.backgroundVideo}
          repeat={true}
          resizeMode={"cover"}
          rate={1.0}
          ignoreSilentSwitch={"obey"}
          onEnd={() => setMuted(!muted)}
        />
        <Pressable
          onPress={() => navigation.navigate(Routes.NotificationScreen)}
          style={styles.notificationMainView}
        >
          <View style={{ paddingTop: Platform.OS == "ios" ? 10 : 0 }}>
            <Image
              source={images.NotificationBell}
              resizeMode="contain"
              style={{
                height: 41,
                width: 43,
              }}
            />
            {pushNotificationCount?.data?.notification_count &&
            pushNotificationCount?.data?.notification_count > 0 ? (
              <View
                style={[
                  styles.notificationViewCount,
                  {
                    top: Platform.OS == "ios" ? 10 : 0,
                  },
                ]}
              >
                <Text style={styles.notificationCountText}>
                  {pushNotificationCount?.data?.notification_count >= 10
                    ? "9+"
                    : pushNotificationCount?.data?.notification_count}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
        <Pressable style={styles.topContainer}>
          <Image source={images.homeLogo} resizeMode="contain" />
        </Pressable>
        <View style={styles.centerContainer}>
          <CustomButton
            title={lang?.Moving_Profile}
            onPress={() => navigation.navigate(Routes.MovingProfile)}
            customTextStyle={{ fontFamily: FontFamily.InriaSansBold }}
          />
        </View>
        <View style={styles.rowContainer}>
          <CustomButton
            customStyle={{ width: "45%", height: verticalScale(30) }}
            customTextStyle={{
              fontSize: moderateScale(10),
              textAlign: "center",
              paddingHorizontal: scale(5),
              fontFamily: FontFamily?.InriaSansBold,
              fontWeight: "600",
            }}
            title={lang?.Rate_SmartMove}
            onPress={ratingApp}
          />
          <CustomButton
            customStyle={{
              width: "45%",
              marginLeft: scale(10),
              height: verticalScale(30),
            }}
            customTextStyle={{
              fontSize: moderateScale(10),
              textAlign: "center",
              paddingHorizontal: scale(5),
              fontFamily: FontFamily?.InriaSansBold,
              fontWeight: "600",
            }}
            title={lang?.Recommend_SmartMove}
            onPress={onShare}
          />
        </View>
        <View style={styles.bottomContainer}>
          <Pressable
            style={styles.leftButton}
            onPress={() => navigation.navigate(Routes.Profile)}
          >
            <Shadow
              offset={[0, -1]}
              paintInside
              style={styles.leftShadowButton}
            >
              <Image
                style={styles.settingIcon}
                source={images.Profile}
                resizeMode="contain"
              />
            </Shadow>
          </Pressable>
          <Pressable
            style={styles.centerButton}
            onPress={() => {
              navigation.navigate(Routes.Cart);
            }}
          >
            <SVGImages.CartIcon />
          </Pressable>
          <Pressable
            style={styles.rightButton}
            onPress={() => navigation.navigate(Routes.Settings)}
          >
            <Shadow
              offset={[0, -1]}
              paintInside
              style={styles.rightShadowButton}
            >
              <Image
                style={styles.settingIcon}
                source={images.settings}
                resizeMode="contain"
              />
            </Shadow>
          </Pressable>
        </View>
        <Modal animationType="fade" transparent={true} visible={isModal}>
          <View style={styles.ModalVisibleContainerView}>
            <View style={[styles.ModalVisibleContainer]}>
              <View style={{ paddingHorizontal: 10, width: "100%" }}>
                <CustomText
                  title={lang?.Subscription_modal_main_title}
                  textColor={theme.theme}
                  fontSize="20"
                  textAlign="center"
                  fontWeight="900"
                  marginTop="1%"
                  fontFamily={FontFamily?.InriaSansBold}
                />
                <View style={styles.lineView} />
                <CustomText
                  title={lang?.Subscription_modal_sub_title_one}
                  textColor={theme.theme}
                  fontSize="18"
                  textAlign="center"
                  fontWeight="bold"
                  marginTop="6%"
                  fontFamily={FontFamily?.InriaSansRegular}
                />
                <CustomText
                  title={lang?.Subscription_modal_sub_title_two}
                  textColor={theme.theme}
                  fontSize="18"
                  textAlign="center"
                  fontWeight="bold"
                  marginTop="6%"
                  fontFamily={FontFamily?.InriaSansRegular}
                />
              </View>
              <Pressable
                style={[
                  styles.toggleButton,
                  { marginBottom: verticalScale(15) },
                ]}
                onPress={() => {
                  updateSubscriptionStatusAPICall();
                }}
              >
                <CustomText
                  textStyle={styles.buttonText}
                  title={lang?.OK}
                  fontFamily={FontFamily?.InriaSansRegular}
                />
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      <Loader isVisible={isLoading} />
    </CustomBackground>
  );
};

export default Home;
