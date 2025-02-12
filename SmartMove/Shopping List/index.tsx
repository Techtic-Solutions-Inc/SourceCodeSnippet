import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

import { FontFamily } from "../../../../common/AssetUtils";
import { isTextNotEmpty } from "../../../../common/Validation";
import {
  callLogoutRedirectToLogin,
  capitalizeFirstLetter,
  showErrorMessage,
  showSuccessMessage,
} from "../../../../common/helper";
import theme from "../../../../common/theme";
import CustomBackground from "../../../../components/Background";
import Header from "../../../../components/Header";
import CustomInput from "../../../../components/Input";
import Loader from "../../../../components/Loader/Loader";
import CustomText from "../../../../components/Text";
import { UserContext } from "../../../../hooks/useLanguageContext";
import { moderateScale, verticalScale } from "../../../../pixelRatio";
import { RootTabScreenProps, Routes } from "../../../../routes/types";
import {
  BASE_URL,
  SUCCESS_CODE,
  UNAUTHORIZED_CODE,
} from "../../../../services/apis";
import {
  addShoppingCategoryAPI,
  deleteShoppingCategory,
  editShoppingCategory,
  getShoppingCategoryAPI,
} from "../../../../services/rootApis";
import styles from "./styles";
import { SVGImages, images } from "../../../../../assets/images";

const MainShoppingList = ({
  navigation,
  route,
}: RootTabScreenProps<Routes.MainShoppingList>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [add, setAdd] = useState("");
  const [isUserAbleToAddMoreEntries, setUserAbleToAddMoreEntries] =
    useState(true);
  const [editTrue, setEditTrue] = useState(false);
  const [edit, setEdit] = useState("");
  const [editId, setEditId] = useState("");
  const { lang, setLang }: any = useContext(UserContext);
  const rbsheetRef = useRef<any>(null);
  const ref = useRef<any>(null);
  const profileId = route?.params?.profileId;

  useEffect(() => {
    navigation.addListener("focus", async () => {
      getShoppingCategoryAPICall();
    });
  }, [navigation]);

  const getShoppingCategoryAPICall = () => {
    setIsLoading(true);
    getShoppingCategoryAPI(profileId)
      .then(async (response) => {
        setIsLoading(false);
        if (response?.statusCode === SUCCESS_CODE) {
          setUserAbleToAddMoreEntries(response?.isUserAbleToAddMoreEntries);
          setData([
            ...response?.data,
            {
              isNewRoom: true,
            },
          ]);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log("error---", error);
        if (error?.response?.data?.statusCode === UNAUTHORIZED_CODE) {
          callLogoutRedirectToLogin(navigation, setLang);
        }
      });
  };

  const addRoom = () => {
    [rbsheetRef?.current.close()];
    if (!isTextNotEmpty(add)) {
      showErrorMessage(lang?.Please_enter_value);
    } else {
      setIsLoading(true);
      addShoppingCategoryAPI(add, profileId)
        .then(async (res: any) => {
          setIsLoading(false);
          showSuccessMessage(res?.message);
          getShoppingCategoryAPICall();
          setAdd("");
        })
        .catch((error: any) => {
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  };

  const editRoom = () => {
    [rbsheetRef?.current.close()];
    if (!isTextNotEmpty(edit)) {
      showErrorMessage(lang?.Please_enter_value);
    } else {
      setIsLoading(true);
      editShoppingCategory(editId, edit, profileId)
        .then(async (res: any) => {
          setIsLoading(false);
          showSuccessMessage(res?.message);
          getShoppingCategoryAPICall();
        })
        .catch((error: any) => {
          setIsLoading(false);
          showErrorMessage(
            error?.response?.data?.message ?? lang?.Something_went_wrong
          );
        });
    }
  };

  const deleteCategoryApi = (id: any) => {
    setIsLoading(true);
    deleteShoppingCategory(id, profileId)
      .then(async (res: any) => {
        setIsLoading(false);
        showSuccessMessage(res?.message);
        getShoppingCategoryAPICall();
      })
      .catch((error: any) => {
        setIsLoading(false);
        showErrorMessage(
          error?.response?.data?.message ?? lang?.Something_went_wrong
        );
      });
  };

  const deleteCategoryPopUp = (id: any) =>
    Alert.alert(
      lang?.Delete_Category_Alert_Title,
      lang?.Delete_Category_Alert_Description,
      [
        {
          text: lang?.Cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: lang?.OK,
          onPress: () => {
            deleteCategoryApi(id);
          },
        },
      ]
    );

  const renderItem: ListRenderItem<any> = ({ item, index }) => {
    if (item?.isNewRoom) {
      return (
        <Pressable
          onPress={() => {
            if (isUserAbleToAddMoreEntries) {
              setEditTrue(false);
              setEdit("");
              setEditId("");
              setAdd("");
              [rbsheetRef?.current.open()];
            } else if (isUserAbleToAddMoreEntries === false) {
              showErrorMessage(lang?.Upgrade_plan_to_add_more_items);
            } else {
              showErrorMessage(lang?.Something_went_wrong);
            }
          }}
          style={[styles.OtherCatStyle]}
        >
          <Image
            source={images?.OtherCat}
            resizeMode="contain"
            style={styles.OtherItemImage}
          />
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() => {
          navigation.navigate(Routes.SubShoppingList, {
            item: item,
            profileId: profileId,
          });
        }}
        style={styles.commenMainView}
      >
        {item?.smartMove === "false" && (
          <Image
            source={{ uri: BASE_URL + item?.shopping_category_image }}
            resizeMode="contain"
            style={styles.itemImage}
          />
        )}
        {item?.smartMove === "true" && (
          <View
            style={{
              backgroundColor: theme.white,
              top: 15,
              right: 15,
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Pressable
              onPress={() => {
                setEditTrue(true);
                setEditId(item?._id);
                setEdit(capitalizeFirstLetter(item?.shopping_category_name));
                setAdd("");
                [rbsheetRef?.current.open()];
              }}
            >
              <Image
                style={{ width: 20, height: 20 }}
                source={images.EditIcon}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable
              onPress={() => {
                deleteCategoryPopUp(item?._id);
              }}
              style={{ marginLeft: 10 }}
            >
              <SVGImages.Delete />
            </Pressable>
          </View>
        )}
        <CustomText
          textColor={theme.theme}
          fontSize={moderateScale(16)}
          fontFamily={FontFamily.InriaSansRegular}
          title={capitalizeFirstLetter(item?.shopping_category_name)}
          numberOfLines={2}
          marginTop="3%"
          textAlign="center"
        />
      </Pressable>
    );
  };

  return (
    <CustomBackground>
      <Header
        title={lang?.Shopping_List}
        onBackPress={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.container} />
      <View style={styles.mainContainer}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <FlatList
            bounces={false}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            style={styles.flatlistStyle}
            contentContainerStyle={{
              paddingBottom: Platform.OS == "android" ? 20 : 10,
              paddingLeft: verticalScale(10),
            }}
          />
        </ScrollView>
      </View>
      <Loader isVisible={isLoading} />
      <RBSheet
        ref={rbsheetRef}
        openDuration={250}
        customStyles={{
          container: styles.rbsheetContainerStyle,
        }}
      >
        <View>
          <CustomInput
            value={editTrue ? edit : add}
            onChangeText={editTrue ? setEdit : setAdd}
            placeholder={".........................................."}
            returnKeyType="done"
            inputContainer={{
              marginTop: verticalScale(15),
              marginBottom: verticalScale(5),
            }}
            textInputStyle={{ fontSize: moderateScale(18) }}
            inputRef={ref}
          />
          <Pressable
            style={[
              styles.toggleButton,
              {
                backgroundColor: theme.theme,
              },
            ]}
            onPress={editTrue ? editRoom : addRoom}
          >
            <CustomText
              fontFamily={FontFamily.InriaSansRegular}
              textStyle={styles.buttonText}
              title={editTrue ? lang?.Confirm : lang?.Add}
            />
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              { marginBottom: verticalScale(15), backgroundColor: theme.red },
            ]}
            onPress={() => {
              [rbsheetRef?.current.close()];
              setAdd("");
            }}
          >
            <CustomText
              fontFamily={FontFamily.InriaSansRegular}
              textStyle={styles.buttonText}
              title={lang?.Cancel}
            />
          </Pressable>
        </View>
      </RBSheet>
    </CustomBackground>
  );
};

export default MainShoppingList;
