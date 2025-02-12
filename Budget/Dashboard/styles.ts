import { StyleSheet } from "react-native";
import theme from "../../../common/theme";

export const DashboardStyle = StyleSheet.create({
  tabItem: {
    height: 60,
    width: 60,
    backgroundColor: theme.app.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    position: "absolute",
    top: -29,
    borderWidth: 5,
    borderColor: theme.item_bg,
  },
});
