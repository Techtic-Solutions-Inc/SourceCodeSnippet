import { Platform, StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../pixelRatio";
import theme from "../../../common/theme";
import { FontFamily } from "../../../common/AssetUtils";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginHorizontal: scale(22),
  },
  appLogoImage: {
    alignSelf: "center",
    // marginTop: Platform.OS == "ios" ? verticalScale(30) : verticalScale(60),
  },

  lineView: {
    height: verticalScale(5),
    backgroundColor: theme.white,
    width: "85%",
    marginTop: verticalScale(15),
    alignSelf: "center",
  },
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: -2, height: 1 },
    textShadowRadius: 3,
    alignSelf: "center",
  },
  socialLoginView: {
    backgroundColor: theme.black,
    height: verticalScale(38),
    paddingStart: scale(30),
    alignItems: "center",
    flexDirection: "row",
    borderRadius: moderateScale(30),
    marginTop: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  socialLoginText: {
    color: theme.white,
    fontFamily: FontFamily.InriaSansRegular,
    fontSize: moderateScale(19),
    textAlign: "center",
    marginStart: moderateScale(20),
  },
});

export default styles;
