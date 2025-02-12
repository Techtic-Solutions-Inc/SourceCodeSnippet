import { StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../pixelRatio";
import theme from "../../../../common/theme";
import { FontFamily } from "../../../../common/AssetUtils";

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  mainContainer: {
    flex: 1,
  },
  flatlistStyle: {
    marginTop: verticalScale(10),
    alignSelf: "center",
    paddingTop: 10,
  },
  titleText: {
    color: theme.white,
    fontSize: moderateScale(35),
    fontFamily: FontFamily.InriaSansRegular,
  },
  smartMoveflatlistStyle: {
    marginTop: verticalScale(1),
    paddingHorizontal: moderateScale(25),
    alignSelf: "center",
  },
  commenMainView: {
    backgroundColor: theme.white,
    marginBottom: verticalScale(27),
    borderRadius: moderateScale(10),
    height: moderateScale(145),
    width: moderateScale(145),
    marginEnd: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    padding: 10,
  },
  OtherCatStyle: {
    backgroundColor: theme.theme,
    marginBottom: verticalScale(27),
    borderRadius: moderateScale(10),
    borderColor: theme.white,
    height: moderateScale(145),
    width: moderateScale(145),
    marginEnd: moderateScale(12),
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  OtherItemImage: {
    height: moderateScale(70),
    width: moderateScale(70),
  },
  itemImage: {
    height: 95,
    width: 95,
  },
  rbsheetContainerStyle: {
    width: "90%",
    alignSelf: "center",
    marginBottom: verticalScale(30),
    borderRadius: moderateScale(18),
    backgroundColor: theme.theme,
    padding: scale(15),
    borderColor: theme.white,
    borderWidth: moderateScale(5),
    justifyContent: "center",
  },
  toggleButton: {
    height: verticalScale(35),
    backgroundColor: "transparent",
    borderWidth: moderateScale(3.5),
    borderColor: theme.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(30),
    width: "100%",
    marginTop: verticalScale(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonText: {
    color: theme.white,
    fontSize: moderateScale(23),
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: -2, height: 1 },
    textShadowRadius: 3,
  },
});

export default styles;
