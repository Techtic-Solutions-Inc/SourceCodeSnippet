import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import analytics from "@react-native-firebase/analytics";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  FlatList,
  ListRenderItem,
  Pressable,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";

import { FontFamily } from "../../../common/AssetUtils";
import { Strings } from "../../../common/Strings";
import theme from "../../../common/theme";
import CustomButton from "../../../component/Button";
import Loader from "../../../component/Loader/Loader";
import NoDataView from "../../../component/NoData";
import CustomText from "../../../component/Text";
import { height } from "../../../pixelRatio";
import { RootTabScreenProps, Routes } from "../../../routes/types";
import { gA4addCartAPI, ourVehicleListAPI } from "../../../services/mainApis";
import AdditionInformation from "../ListOfCars/AdditionInformation";
import styles from "./styles";
import { Keys, readString } from "../../../common/Storage";
import VehicleDetailsModal from "../../../component/VehicleDetailsModal";
import { UserImagesContext } from "../../../hooks/useImagesContext";

const Vehicle = ({ navigation }: RootTabScreenProps<Routes.Vehicle>) => {
  const [data, setData] = useState([]);
  const [isSheetClose, setSheetClose] = useState(true);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(-1);
  const [additionalInfoModal, setAdditionalInfoModal] = useState(false);

  const bottomSheetRef = useRef<any>(null);
  const { images }: any = useContext(UserImagesContext);
  const snapPoints = useMemo(() => ["85%"], []);
  const backDropOpacity = 0.6;

  useEffect(() => {
    navigation.addListener("focus", () => {
      getOurVehicleListAPI();
    });
  }, [navigation]);

  const getOurVehicleListAPI = async () => {
    setLoading(true);
    ourVehicleListAPI()
      .then((res: any) => {
        setLoading(false);
        if (res?.length > 0) {
          setData(res);
        }
      })
      .catch((error) => {
        console.log("error.response" + JSON.stringify(error.response));
        setLoading(false);
      });
  };

  useEffect(() => {
    function handleBackButtonClick() {
      if (!isSheetClose) {
        onClose();
        return true;
      } else {
        return false;
      }
    }
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonClick
      );
    };
  }, [isSheetClose]);

  const onClose = () => {
    bottomSheetRef.current.close();
  };

  const GA4APICall = async (vehicle: any) => {
    setLoading(true);
    const GetCmp = await readString(Keys.LOCATION_CODE);
    gA4addCartAPI(GetCmp ?? "", vehicle?.title, vehicle?.Rate?.BaseRate)
      .then(async (res: any) => {
        setLoading(false);
        const addToCartObject = {
          items: [
            {
              item_name: vehicle?.title,
              quantity: 1,
              price: parseFloat(vehicle?.Rate?.TnM),
            },
          ],
          value: parseFloat(vehicle?.Rate?.TnM),
          currency: "USD",
        };
        await analytics().logEvent("add_to_cart", addToCartObject);
      })
      .catch((error) => {
        setLoading(false);
        if (error?.response) {
          console.log("error:", JSON.stringify(error.response));
        } else {
          console.log("error:", error.message);
        }
      });
  };

  const onAdditionalInformation = useCallback(async (index: number) => {
    setSheetClose(false);
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={backDropOpacity}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        style={[props?.style, { backgroundColor: theme.Transparent }]}
      />
    ),
    [backDropOpacity]
  );

  const vehicleListItem: ListRenderItem<any> = ({ item, index }) => {
    return (
      <Pressable
        style={styles.rootContainer}
        onPress={() => {
          onAdditionalInformation(0);
          setIndex(index);
        }}
      >
        <View style={styles.topContainer}>
          <FastImage
            style={styles.itemImage}
            source={
              item?.acf?.vehicle_image
                ? { uri: item?.acf?.vehicle_image }
                : images?.dummyImage
            }
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.rowContainer}>
              <CustomText
                title={item?.title}
                textColor={theme.text.title}
                fontSize="16"
                paddingHorizontal="10"
                fontWeight="700"
                fontFamily={FontFamily.NunitoSansBold}
                numberOfLines={1}
                ellipsizeMode="tail"
                textStyle={{ flex: 1 }}
              />
            </View>
            <CustomText
              title={item?.acf?.vehicle_Model}
              textColor={theme.text.title}
              fontSize="12"
              fontWeight="400"
              numberOfLines={1}
              ellipsizeMode="tail"
              marginTop="3"
              fontFamily={FontFamily.NunitoSansRegular}
              textStyle={{ paddingLeft: 10 }}
            />
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <CustomText
            title={Strings.Additional_Information}
            textColor={theme.app.primary}
            fontSize="14"
            fontWeight="400"
            textUnderLine="underline"
            fontFamily={FontFamily.NunitoSansRegular}
            onPress={() => {
              setIndex(index);
              setAdditionalInfoModal(true);
            }}
          />
          <CustomButton
            title={Strings.Book_vehicle}
            borderRadius={10}
            backgroundColor={theme.app.primary}
            textColor={theme.white}
            fontSize="16"
            fontWeight="700"
            fontFamily={FontFamily.NunitoSansBold}
            paddingVertical={"0"}
            paddingHorizontal="16"
            customStyle={styles.modalButtonStyle}
            onPress={() => {
              navigation.navigate(Routes.BookVehicle, {
                data: item,
              });
            }}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.safeAreaViewContainer}>
      <FastImage
        source={{ uri: images.DashboardHeaderShape }}
        style={styles.bgImage}
        resizeMode={FastImage.resizeMode.stretch}
      />
      <View style={styles.headerContainer}>
        <CustomText
          title={Strings.Our_Vehicles}
          textColor={theme.white}
          fontSize="32"
          fontWeight="700"
          fontFamily={FontFamily.NunitoSansBold}
        />
        <CustomText
          title={Strings.Vehicles_here}
          textColor={theme.white}
          fontSize="16"
          fontWeight="400"
          marginTop="10"
          numberOfLines={1}
          ellipsizeMode={"tail"}
          fontFamily={FontFamily.NunitoSansRegular}
        />
      </View>
      <View style={styles.container}>
        <FlatList
          bounces={false}
          data={data.sort((a: any, b: any) => {
            return a.id - b.id;
          })}
          renderItem={vehicleListItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ paddingVertical: 5 }}
          ListEmptyComponent={() =>
            loading ? null : (
              <NoDataView
                title={Strings.No_data_found}
                customContainer={{ height: height / 1.5 }}
              />
            )
          }
        />
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enabledGestureInteraction={true}
        enabledContentGestureInteraction={true}
        enabledContentTapInteraction={true}
        enabledInnerScrolling={true}
        enablePanDownToClose
        onClose={() => setSheetClose(true)}
        handleComponent={null}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <AdditionInformation
            onClose={onClose}
            onSelect={() => {
              GA4APICall(data[index]);
              navigation.navigate(Routes.BookVehicle, {
                data: data[index],
              });
              onClose();
            }}
            data={data[index]}
            isAllVehicle={true}
          />
        </BottomSheetScrollView>
      </BottomSheet>
      <VehicleDetailsModal
        title={data[index]?.title ?? "Title"}
        category={data[index]?.acf?.vehicle_Model}
        onClose={() => setAdditionalInfoModal(false)}
        modalVisible={additionalInfoModal}
        detailsData={data[index]?.acf?.vehicle_additional_vehicle_information}
        addInfo={true}
      />
      <Loader isVisible={loading} />
    </View>
  );
};

export default Vehicle;
