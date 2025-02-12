import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FastImage from "react-native-fast-image";

import { FontFamily } from "../../../common/AssetUtils";
import { Strings } from "../../../common/Strings";
import theme from "../../../common/theme";
import {
  RootStackParamList,
  RootTabScreenProps,
  Routes,
} from "../../../routes/types";
import Account from "../Account";
import EditProfile from "../EditProfile";
import Claims from "../Claims";
import MyBooking from "../MyBooking";
import Reservation from "../Reservation";
import Vehicle from "../OurVehicles";
import { UserImagesContext } from "../../../hooks/useImagesContext";

const Tab = createBottomTabNavigator<RootStackParamList>();
const ProfileScreenStack = createNativeStackNavigator<RootStackParamList>();

function ProfileStackScreen() {
  return (
    <ProfileScreenStack.Navigator initialRouteName={Routes.Account}>
      <ProfileScreenStack.Screen
        name={Routes.Account}
        component={Account}
        options={{ headerShown: false }}
      />
      <ProfileScreenStack.Screen
        name={Routes.EditProfile}
        component={EditProfile}
        options={{ headerShown: false }}
      />
    </ProfileScreenStack.Navigator>
  );
}
const Dashboard = ({ navigation }: RootTabScreenProps<Routes.Dashboard>) => {
  const { images }: any = useContext(UserImagesContext);

  const activeTab = (focused: any, Icon: any) => {
    return focused ? <View>{Icon}</View> : <View>{Icon}</View>;
  };
  return (
    <Tab.Navigator
      initialRouteName={Routes.Reservation}
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: FontFamily.NunitoSansRegular,
          marginBottom: Platform.OS == "ios" ? 0 : 25,
        },
        tabBarStyle: {
          shadowColor: theme.shadowTab,
          shadowOpacity: 0.5,
          shadowRadius: 10,
          height: 90,
          shadowOffset: {
            height: 0,
            width: 1,
          },
          elevation: 5,
        },
        tabBarActiveTintColor: theme.app.primary,
        tabBarInactiveTintColor: theme.text.light,
      }}
    >
      <Tab.Screen
        name={Routes.Reservation}
        component={Reservation}
        initialParams={{
          modifyStatus: undefined,
          modifyItem: undefined,
          modifyData: undefined,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate(Routes.Reservation, {
              modifyStatus: undefined,
              modifyItem: undefined,
              modifyData: undefined,
            });
          },
        })}
        options={{
          title: Strings.Reservation,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            activeTab(
              focused,
              <FastImage
                source={{
                  uri: focused
                    ? images.Icon_Calendar_day_Fill
                    : images.Icon_Calendar_day,
                }}
                style={{ height: 28, width: 28 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
        }}
      />
      <Tab.Screen
        name={Routes.Claims}
        component={Claims}
        options={{
          title: Strings.Claims,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            activeTab(
              focused,
              <FastImage
                source={{
                  uri: focused ? images.Icon_claim_Fill : images.Icon_claim,
                }}
                style={{ height: 28, width: 28 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
        }}
      />
      <Tab.Screen
        name={Routes.Vehicle}
        component={Vehicle}
        options={{
          title: Strings.Vehicle,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            activeTab(
              focused,
              <FastImage
                source={{
                  uri: focused ? images.Icon_vehicle_Fill : images.Icon_vehicle,
                }}
                style={{ height: 28, width: 28 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
        }}
      />
      <Tab.Screen
        name={Routes.MyBooking}
        component={MyBooking}
        options={{
          title: Strings.My_Booking,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            activeTab(
              focused,
              <FastImage
                source={{
                  uri: focused ? images.Icon_booking_Fill : images.Icon_booking,
                }}
                style={{ height: 28, width: 28 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
        }}
      />
      <Tab.Screen
        name={Routes.Account}
        component={ProfileStackScreen}
        options={{
          title: Strings.Account,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            activeTab(
              focused,
              <FastImage
                source={{
                  uri: focused ? images.Icon_profile_Fill : images.Icon_profile,
                }}
                style={{ height: 28, width: 28 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Dashboard;
