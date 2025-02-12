import { useNetInfo } from "@react-native-community/netinfo";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  AppState,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "../../../assets/colors/Colors";
import { Fonts } from "../../../assets/fonts/Fonts";
import BackIcon from "../../../assets/images/back-bg.svg";
import { Strings } from "../../common/Strings";
import HowItWorkDialog from "../../components/HowItWorkDialog";
import Loading from "../../components/Loading";
import Toolbar from "../../components/Toolbar";
import WishListItem from "../../components/WishListItem";
import { routes } from "../../navigation/routes";
import { callFavUnFavApi } from "../../redux/actions/userActions";
import { Constant } from "../../utils/Constant";
import { readString } from "../../utils/storage";
import { showErrorMessage } from "../../utils/Toast";
import { useAppState } from "../../utils/useAppState";
import { capitalizeWord } from "../../utils/Tools";

const WishListProduct = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);
  const [wishListData, setWishListData] = useState(route?.params?.products ?? []);
  const [categoryName, setCategoryName] = useState(route?.params?.category);
  const isFocused = useIsFocused();
  const [isHowItWorkVisible, setIsHowItWorkVisible] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const { isConnected } = useNetInfo();

  useAppState((nextAppState) => setAppState(nextAppState));

  const favUnFavApi = (product_id) => {
    dispatch(callFavUnFavApi(product_id))
      .then((response) => {
        if (response.success) {
          const updatedProducts = wishListData.filter((product) => product.product_id !== product_id);
          updatedProducts.length === 0 ? navigation.goBack() : setWishListData(updatedProducts);
        } else {
          showErrorMessage(response.error);
        }
      })
      .catch((err) => showErrorMessage(err.message));
  };

  const renderItems = ({ item }) => (
    <WishListItem
      page={routes.YourWishList}
      item={item}
      favPress={() => (isConnected ? favUnFavApi(item.product_id) : showErrorMessage(Strings.errorNoInternet))}
      onItemPress={() => (isConnected ? navigation.navigate(routes.ProductDetail, { productId: item.product_id, productName: item.product_name }) : showErrorMessage(Strings.errorNoInternet))}
      preferencePress={() => setIsHowItWorkVisible(true)}
    />
  );

  return (
    <View style={styles.mainView}>
      <SafeAreaView style={styles.safeAreaView} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.screen_bg} />
      <Toolbar
        isLeftIcon
        leftIcon={<BackIcon />}
        title={capitalizeWord(categoryName)}
        textStyle={{ color: Colors.white }}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {wishListData.length > 0 ? (
          <FlatList data={wishListData} renderItem={renderItems} keyExtractor={(item, index) => index.toString()} showsVerticalScrollIndicator={false} />
        ) : (
          !loading && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{Strings.noDataFound}</Text>
            </View>
          )
        )}
      </View>
      <Loading isVisible={loading} />
      <HowItWorkDialog
        isVisible={isHowItWorkVisible}
        setVisible={setIsHowItWorkVisible}
        routeType="score"
        onPress={() => {
          setIsHowItWorkVisible(false);
          navigation.navigate(routes.AdjustSavePreference, { routeType: "score" });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: { flex: 1, backgroundColor: Colors.screen_bg },
  safeAreaView: { backgroundColor: Colors.screen_bg },
  container: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 15, paddingTop: 5, paddingBottom: 10 },
  noDataContainer: { justifyContent: "center", flex: 1 },
  noDataText: { textAlign: "center", fontSize: 20 },
});

export default WishListProduct;
