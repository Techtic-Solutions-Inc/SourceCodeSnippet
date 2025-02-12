import { StyleSheet } from "react-native";
import theme from "../../../common/theme";
import { scale } from "../../../pixelRatio";

export const BookVehicleStyle = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: theme.white,
  },
  container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  subContainer: {
    flex: 1,
    backgroundColor: theme.white,
    marginHorizontal: scale(22),
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  pickupDateStyle: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 1,
  },
  pickupTimeStyle: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 1,
    marginLeft: 15,
  },
  locationStyle: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  buttonStyle: {
    height: 56,
    alignItems: "center",
  },
  lastNameStyle: {
    marginTop: 10,
    marginBottom: 1,
  },
});
