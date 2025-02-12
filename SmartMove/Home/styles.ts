import { StatusBar, StyleSheet } from "react-native";
import theme from "../../../common/theme";
import { moderateScale, scale, verticalScale } from "../../../pixelRatio";
import { FontFamily } from "../../../common/AssetUtils";

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: verticalScale(30),
    marginHorizontal: scale(22),
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: scale(22),
  },
  bottomContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: StatusBar.currentHeight,
  },
  leftShadowButton: {
    backgroundColor: theme.white,
    width: scale(106),
    height: verticalScale(90),
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: moderateScale(20),
  },
  leftButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  rightShadowButton: {
    backgroundColor: theme.white,
    width: scale(106),
    height: verticalScale(90),
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: moderateScale(20),
  },
  rightButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  centerButton: {
    position: "absolute",
    bottom: verticalScale(22),
  },
  settingIcon: {
    height: verticalScale(60),
    width: scale(60),
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "stretch",
    bottom: 0,
    right: 0,
  },
  rowContainer: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  ModalVisibleContainerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.loader,
  },
  ModalVisibleContainer: {
    backgroundColor: theme.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    margin: scale(10),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
  },
  toggleButton: {
    height: verticalScale(35),
    backgroundColor: theme.theme,
    borderWidth: moderateScale(3.5),
    borderColor: theme.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(30),
    marginTop: verticalScale(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    paddingHorizontal: 140,
  },
  buttonText: {
    color: theme.white,
    fontSize: moderateScale(18),
  },
  lineView: {
    height: verticalScale(5),
    backgroundColor: theme.white,
    marginTop: verticalScale(10),
  },
  notificationMainView: {
    alignSelf: "flex-end",
    marginTop: 40,
    marginRight: 15,
  },
  notificationViewCount: {
    height: 19,
    width: 19,
    borderRadius: 17,
    backgroundColor: theme.red,
    position: "absolute",
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCountText: {
    color: "white",
    alignSelf: "center",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: FontFamily.InriaSansBold,
  },
});

export default styles;
