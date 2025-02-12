import { Platform, StyleSheet } from "react-native";
import theme from "../../../common/theme";
import { scale } from "../../../pixelRatio";

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.app.secondary,
    paddingTop: Platform.OS == "ios" ? 60 : 40,
  },
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: theme.white,
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: 300,
  },
  headerContainer: {
    paddingHorizontal: scale(22),
  },
  itemContainer: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.white,
    marginBottom: 15,
    padding: 15,
    marginHorizontal: scale(22),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  raiseClaimContainer: {
    backgroundColor: theme.addButton,
    marginTop: 20,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginHorizontal: scale(22),
  },
  topContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.white,
  },
  rootContainer: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.white,
    marginBottom: 15,
    padding: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  itemImage: {
    height: 50,
    width: 70,
  },
  bottomContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  modalButtonStyle: {
    height: 30,
    alignItems: "center",
  },
});

export default styles;
