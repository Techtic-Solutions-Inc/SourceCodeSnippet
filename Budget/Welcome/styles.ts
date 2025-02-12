import { StyleSheet } from "react-native";
import theme from "../../../common/theme";
import { moderateScale, scale, verticalScale } from "../../../pixelRatio";
import { FontFamily } from "../../../common/AssetUtils";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: theme.white,
  },
  imageBackground: {
    height: verticalScale(450),
  },
  buttonViewStyle: {
    marginHorizontal: scale(20),
  },
  topTextStyle: {
    marginTop: "30%",
    marginHorizontal: "10%",
  },
  welcomeTextStyle: {
    color: theme.app.primary,
    fontSize: moderateScale(28),
    fontFamily: FontFamily.NunitoSansBold,
  },
  appNameStyle: {
    color: theme.white,
    fontSize: moderateScale(30),
    fontFamily: FontFamily.NunitoSansBold,
  },
  subTextStyle: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.NunitoSansRegular,
    color: theme.white,
    marginTop: verticalScale(7),
  },
  skipView: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: verticalScale(25),
  },
});

export default styles;
