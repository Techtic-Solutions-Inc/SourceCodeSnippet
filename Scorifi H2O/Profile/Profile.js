import { useNavigation } from "@react-navigation/native";
import { format, formatISO, parse, parseISO } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Dropdown } from "react-native-element-dropdown";
import ImagePicker from "react-native-image-crop-picker";
import { btoa } from "react-native-quick-base64";
import { useDispatch, useSelector } from "react-redux";
import {
  default as Colors,
  default as colors,
} from "../../../assets/colors/Colors";
import { Fonts } from "../../../assets/fonts/Fonts";
import BackIcon from "../../../assets/images/back-bg.svg";
import CalenderIcon from "../../../assets/images/calendar.svg";
import CameraIcon from "../../../assets/images/camera.png";
import DeleteIcon from "../../../assets/images/delete.svg";
import DownArrowIcon from "../../../assets/images/down-arrow.svg";
import EditPinIcon from "../../../assets/images/edit-profile.svg";
import GalleryIcon from "../../../assets/images/gallery.png";
import { Strings } from "../../common/Strings";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import Loading from "../../components/Loading";
import Toolbar from "../../components/Toolbar";
import { atob } from "react-native-quick-base64";
import { setIsAuthenticated } from "../../core/globalState";
import {
  callDeleteAccountApi,
  callEditProfileApi,
} from "../../redux/actions/userActions";
import { requestCameraPermissionsIfNeeded } from "../../utils/CameraPermissionHandler";
import { Constant } from "../../utils/Constant";
import {
  EthnicityList,
  GenderList,
  HeightList,
  WeightList,
} from "../../utils/Modals";
import { showErrorMessage, showSuccessMessage } from "../../utils/Toast";
import {
  isTextNotEmpty,
  validateHeight,
  validatePhoneNumber,
} from "../../utils/Validation";
import { deleteString, readString, storeString } from "../../utils/storage";
import { useAppState } from "../../utils/useAppState";
import CameraPermisionDialog from "../../components/CameraPermisionDialog";
import FastImage from "react-native-fast-image";

const Profile = () => {
  const loading = useSelector((state) => state.user.loading);
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(Strings.select);
  const [dateOfBirthFormat, setDateOfBirthFormat] = useState(Strings.select);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [healthCondition, setHeathCondition] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [gender, setGender] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [cameraDialogModal, setCameraDialogModal] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [profile, setProfile] = useState("");
  const [chooseImage, setChooseImage] = useState();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const heightRef = useRef(null);
  const weightRef = useRef(null);
  const healthCondRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [chooseImageModal, setChooseImageModal] = useState(false);
  const dispatch = useDispatch();
  const [appState, setAppState] = useState(AppState.currentState);
  const [otherGender, setOtherGender] = useState("");
  const [otherEthnicity, setOtherEthnicity] = useState("");

  useEffect(() => {
    initialCalls();
  }, []);

  const initialCalls = async () => {
    await readString(Constant.USER_DATA).then((data) => {
      let userData = JSON.parse(atob(data) || "");
      setName(userData?.name);
      setEmail(userData?.email);
      setMobile(userData?.phone_number ? userData?.phone_number : "");
      setProfile(userData?.profile_pic);
      let formattedDate = "";
      let formattedDate2 = "";
      if (userData?.dob !== null && userData?.dob !== "") {
        const date = userData?.dob;
        const parsedDate = parseISO(date);
        formattedDate = format(parsedDate, "dd-MM-yyyy");
        formattedDate2 = format(parsedDate, "MM-dd-yyyy");
      } else {
        formattedDate = Strings.select;
        formattedDate2 = Strings.select;
      }

      setEthnicity(userData?.ethnicity);
      if (userData?.ethnicity == "Other") {
        setOtherEthnicity(userData?.other_ethnicity);
      }
      setHeight(userData?.height !== null ? "" + userData?.height : "");
      setWeight(userData?.weight !== null ? "" + userData?.weight : "");
      setHeightUnit(
        userData?.height_unit !== null ? "" + userData?.height_unit : ""
      );
      setWeightUnit(
        userData?.weight_unit !== null ? "" + userData?.weight_unit : ""
      );
      setHeathCondition(userData?.health_condition);
      setDateOfBirth(formattedDate);
      setDateOfBirthFormat(formattedDate2);
      setGender(userData?.gender);
      if (userData?.gender == "Other") {
        setOtherGender(userData?.other_gender);
      }
    });
  };

  useAppState((nextAppState) => {
    setAppState(nextAppState);
  });

  const focusNextInput = (nextInputRef) => {
    if (nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  const checkValidation = () => {
    Keyboard.dismiss();
    if (!isTextNotEmpty(name)) {
      showErrorMessage(Strings.errorName2);
    } else if (name.length < 2) {
      showErrorMessage(Strings.errorValidName);
    } else if (isTextNotEmpty(mobile) && !validatePhoneNumber(mobile)) {
      showErrorMessage(Strings.enterValidMobile);
    } else if (isTextNotEmpty(height) && !validateHeight(height)) {
      showErrorMessage(Strings.errorHeight);
    } else if (isTextNotEmpty(height) && height > 300) {
      showErrorMessage(Strings.errorMorethanHeight);
    } else if (isTextNotEmpty(weight) && !validateHeight(weight)) {
      showErrorMessage(Strings.errorWeight);
    } else if (isTextNotEmpty(weight) && weight > 500) {
      showErrorMessage(Strings.errorMorethanWeight);
    } else {
      editProfileApi();
    }
  };

  const deleteAccountDialog = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure, you want to delete account?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            deleteAccountApi();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const deleteAccountApi = () => {
    dispatch(callDeleteAccountApi())
      .then(async (response) => {
        if (response.success === true) {
          await storeString(Constant.TOKEN, JSON.stringify(btoa("")));
          await deleteString(Constant.IN_PROGRESS);
          await deleteString(Constant.WISH_LIST_VISIT);
          setIsAuthenticated(false, true);
        } else {
          showErrorMessage(response.error);
        }
      })
      .catch((err) => {
        showErrorMessage(err.message);
      });
  };

  const editProfileApi = () => {
    dispatch(
      callEditProfileApi(
        name,
        mobile,
        chooseImage,
        height,
        weight,
        dateOfBirthFormat === Strings.select ? "" : dateOfBirthFormat,
        ethnicity,
        ethnicity == "Other" && otherEthnicity !== "" ? otherEthnicity : "",
        healthCondition,
        gender,
        gender == "Other" && otherGender !== "" ? otherGender : "",
        heightUnit,
        weightUnit,
        profile
      )
    )
      .then((response) => {
        if (response.success === true) {
          showSuccessMessage(response.message);
          updateUserData();
        } else {
          showErrorMessage(response.error);
        }
      })
      .catch((err) => {
        if (Platform.OS === "ios") {
          setTimeout(() => {
            if (appState == "active" && err.message == "Network Error") {
              editProfileApi();
            } else {
              showErrorMessage(err.message);
            }
          }, 200);
        } else {
          showErrorMessage(err.message);
        }
      });
  };

  const updateUserData = async () => {
    let userData = await readString(Constant.USER_DATA);
    let temdata = JSON.parse(atob(userData) || "");
    temdata.name = name;
    temdata.phone_number = mobile;
    temdata.profile_pic = profile;
    temdata.ethnicity = ethnicity;
    if (ethnicity == "Other" && otherEthnicity !== "") {
      temdata.other_ethnicity = otherEthnicity;
    }
    temdata.height = "" + height;
    temdata.weight = "" + weight;
    temdata.height_unit = heightUnit;
    temdata.weight_unit = weightUnit;
    temdata.gender = "" + gender;
    if (gender == "Other" && otherGender !== "") {
      temdata.other_gender = otherGender;
    }
    temdata.health_condition = healthCondition;

    if (dateOfBirth !== Strings.select) {
      const date = dateOfBirth;
      const parsedDate = parse(date, "dd-MM-yyyy", new Date());
      const isoDate = formatISO(parsedDate);
      temdata.dob = isoDate;
    }
    await storeString(Constant.USER_DATA, btoa(JSON.stringify(temdata)));
  };

  const captureImage = () => {
    ImagePicker.openCamera({
      cropping: true,
      mediaType: "photo",
      compressImageMaxWidth: 800,
      compressImageMaxHeight: 800,
    })
      .then((image) => {
        setChooseImageModal(!chooseImageModal);
        setProfile(image?.path);
        setChooseImage(image);
      })
      .catch((err) => {
        setChooseImageModal(!chooseImageModal);
      });
  };

  const chooseFile = () => {
    ImagePicker.openPicker({
      cropping: true,
      mediaType: "photo",
      compressImageMaxWidth: 800,
      compressImageMaxHeight: 800,
    })
      .then((image) => {
        setChooseImageModal(!chooseImageModal);
        setProfile(image?.path);
        setChooseImage(image);
      })
      .catch((err) => {
        setChooseImageModal(!chooseImageModal);
      });
  };

  return (
    <View style={styles.mainView}>
      <SafeAreaView style={styles.safeAreaView} />
      <StatusBar barStyle="light-content" backgroundColor={colors.screen_bg} />
      <Toolbar
        isLeftIcon={true}
        leftIcon={<BackIcon />}
        title={Strings.yourProfile}
        textStyle={{ color: colors.white }}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            automaticallyAdjustKeyboardInsets={true}
          >
            <View style={styles.editIconView}>
              <View style={styles.nameBorderView}>
                {profile ? (
                  <FastImage
                    source={{ uri: profile }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text style={styles.nameText}>
                    {"stem.title".substring(0, 1).toLocaleUpperCase()}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (profile) {
                    setProfile("");
                  } else {
                    setChooseImageModal(!chooseImageModal);
                  }
                }}
                style={styles.editIcon}
              >
                {profile ? <DeleteIcon /> : <EditPinIcon />}
              </TouchableOpacity>
            </View>
            <Text style={styles.titleText}>{Strings.yourName}</Text>
            <CustomInput
              ref={nameRef}
              placeholder={Strings.enterYourName}
              returnKeyType="next"
              value={name}
              autoCapitalize="words"
              inputContainer={[styles.inputView]}
              textInputStyle={[styles.textInput]}
              maxLength={30}
              onChangeText={(text) => {
                if (/^[a-zA-Z\s]*$/.test(text) && !/\s{2,}/.test(text)) {
                  setName(text);
                }
              }}
              onSubmitEditing={() => focusNextInput(mobileRef)}
            />
            <Text style={[styles.titleText, { marginTop: 20 }]}>
              {Strings.email}
            </Text>
            <CustomInput
              ref={emailRef}
              placeholder={Strings.enterYourEmail}
              returnKeyType="next"
              value={email}
              editable={false}
              keyboardType={"email-address"}
              inputContainer={[styles.inputView]}
              textInputStyle={[styles.textInput]}
              onChangeText={setEmail}
              onSubmitEditing={() => focusNextInput(mobileRef)}
            />
            <Text style={[styles.titleText, { marginTop: 20 }]}>
              {Strings.phoneNumber}
            </Text>
            <CustomInput
              ref={mobileRef}
              placeholder={Strings.enterYourMobile}
              returnKeyType="next"
              value={mobile}
              keyboardType={"numeric"}
              inputContainer={[styles.inputView]}
              textInputStyle={[styles.textInput]}
              onChangeText={setMobile}
              maxLength={15}
              onSubmitEditing={() => focusNextInput(heightRef)}
            />

            <View style={styles.profileRowView}>
              <View style={[styles.otherDetailView, { marginEnd: 8 }]}>
                <Text style={[styles.titleText, { marginTop: 20 }]}>
                  {Strings.gender}
                </Text>
                <Dropdown
                  style={[styles.dropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={[
                    styles.selectedTextStyle,
                    {
                      color:
                        gender === "-Select-"
                          ? Colors.text.light
                          : Colors.text.title,
                    },
                  ]}
                  itemTextStyle={[styles.selectedTextStyle]}
                  iconStyle={styles.iconStyle}
                  data={GenderList ?? []}
                  maxHeight={200}
                  labelField="title"
                  valueField="value"
                  placeholder={Strings.select}
                  value={gender}
                  onChange={(item) => {
                    if (item != "-Select-") {
                      setGender(item.value);
                    } else {
                      setGender("");
                    }
                  }}
                  renderRightIcon={() => <DownArrowIcon />}
                />
                <View style={styles.divider} />
              </View>
              <View style={[styles.otherDetailView, { marginStart: 8 }]}>
                <Text style={[styles.titleText, { marginTop: 20 }]}>
                  {Strings.dateOfBirth}
                </Text>

                <Pressable
                  style={[
                    styles.dobRowView,
                    {
                      marginEnd: 2,
                    },
                  ]}
                  onPress={() => setOpen(true)}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.placeHolderTextInput,
                      {
                        color:
                          dateOfBirth !== Strings.select
                            ? Colors.text.title
                            : Colors.text.placeHolder,
                      },
                    ]}
                  >
                    {dateOfBirthFormat}
                  </Text>
                  <CalenderIcon />
                </Pressable>
                <DatePicker
                  modal
                  mode={"date"}
                  open={open}
                  date={new Date()}
                  maximumDate={new Date()}
                  onConfirm={(newDate) => {
                    setOpen(false);
                    setDateOfBirth(format(newDate, "dd-MM-yyyy"));
                    setDateOfBirthFormat(format(newDate, "MM-dd-yyyy"));
                  }}
                  onCancel={() => {
                    setOpen(false);
                  }}
                />
                <View style={styles.divider} />
              </View>
            </View>
            {gender == "Other" && (
              <>
                <CustomInput
                  placeholder={"Enter your gender (optional)"}
                  returnKeyType="next"
                  value={otherGender}
                  autoCapitalize="sentences"
                  inputContainer={[styles.inputView]}
                  textInputStyle={[styles.textInput]}
                  onChangeText={setOtherGender}
                />
              </>
            )}
            <View style={styles.profileRowView}>
              <View style={[styles.otherDetailView, { marginEnd: 8 }]}>
                <Text style={[styles.titleText, { marginTop: 20 }]}>
                  {Strings.yourHeight}
                </Text>
                <View style={[styles.profileRowView]}>
                  <CustomInput
                    ref={heightRef}
                    placeholder={Strings.enterYourHeight}
                    returnKeyType="next"
                    value={height}
                    keyboardType={"numeric"}
                    inputContainer={[
                      styles.inputView,
                      { flex: 1, marginEnd: 10 },
                    ]}
                    textInputStyle={[styles.heightTextInput]}
                    onChangeText={setHeight}
                    onSubmitEditing={() => focusNextInput(weightRef)}
                  />
                  <Dropdown
                    style={[styles.unitDropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={[styles.selectedTextStyle]}
                    itemTextStyle={[styles.selectedTextStyle]}
                    data={HeightList ?? []}
                    labelField="title"
                    valueField="value"
                    placeholder={Strings.select}
                    value={heightUnit}
                    onChange={(item) => {
                      setHeightUnit(item.value);
                    }}
                    renderRightIcon={() => <DownArrowIcon />}
                  />
                </View>
                <View style={styles.divideView} />
              </View>
              <View style={[styles.otherDetailView, { marginStart: 8 }]}>
                <Text style={[styles.titleText, { marginTop: 20 }]}>
                  {Strings.yourWeight}
                </Text>
                <View style={[styles.profileRowView, { marginEnd: 8 }]}>
                  <CustomInput
                    ref={weightRef}
                    placeholder={Strings.enterYourWeight}
                    returnKeyType="next"
                    value={weight}
                    keyboardType={"numeric"}
                    inputContainer={[
                      styles.inputView,
                      { flex: 1, marginEnd: 10 },
                    ]}
                    textInputStyle={[styles.heightTextInput]}
                    onChangeText={setWeight}
                    onSubmitEditing={() => focusNextInput(healthCondRef)}
                  />
                  <Dropdown
                    style={[styles.unitDropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={[styles.selectedTextStyle]}
                    itemTextStyle={[styles.selectedTextStyle]}
                    data={WeightList ?? []}
                    labelField="title"
                    valueField="value"
                    placeholder={Strings.select}
                    value={weightUnit}
                    onChange={(item) => {
                      setWeightUnit(item.value);
                    }}
                    renderRightIcon={() => <DownArrowIcon />}
                  />
                </View>
                <View style={styles.divideView} />
              </View>
            </View>

            <View style={[styles.otherDetailView]}>
              <Text style={[styles.titleText, { marginTop: 20 }]}>
                {Strings.ethnicity}
              </Text>
              <Dropdown
                search={true}
                searchPlaceholder={"Search"}
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={[
                  styles.selectedTextStyle,
                  {
                    color:
                      ethnicity === "-Select-"
                        ? Colors.text.light
                        : Colors.text.title,
                  },
                ]}
                itemTextStyle={[styles.selectedTextStyle]}
                iconStyle={styles.iconStyle}
                data={EthnicityList ?? []}
                selectedTextProps={{ numberOfLines: 1 }}
                maxHeight={160}
                labelField="title"
                valueField="value"
                placeholder={Strings.select}
                value={ethnicity}
                onChange={(item) => {
                  if (item != "-Select-") {
                    setEthnicity(item.value);
                  } else {
                    setEthnicity("");
                  }
                }}
                renderRightIcon={() => <DownArrowIcon />}
              />
              <View style={styles.divider} />
            </View>
            {ethnicity == "Other" && (
              <>
                <CustomInput
                  placeholder={"Enter your ethnicity (optional)"}
                  returnKeyType="next"
                  value={otherEthnicity}
                  autoCapitalize="sentences"
                  inputContainer={[styles.inputView]}
                  textInputStyle={[styles.textInput]}
                  onChangeText={setOtherEthnicity}
                />
              </>
            )}
            <Text style={[styles.titleText, { marginTop: 20 }]}>
              {Strings.healthCondition}
            </Text>
            <CustomInput
              ref={healthCondRef}
              placeholder={Strings.tellUsYourHealthCondition}
              returnKeyType="done"
              value={healthCondition}
              autoCapitalize="sentences"
              maxLength={500}
              inputContainer={[styles.inputView]}
              textInputStyle={[styles.textInput]}
              onChangeText={setHeathCondition}
            />
          </ScrollView>
        </View>

        <CustomButton
          buttonViewStyle={styles.buttonView}
          title={Strings.updateProfile}
          onPress={() => {
            checkValidation();
          }}
        />

        <Text
          style={[styles.deleteText]}
          onPress={() => {
            deleteAccountDialog();
          }}
        >
          {Strings.delete}
        </Text>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={chooseImageModal}
        onRequestClose={() => {
          setChooseImageModal(!chooseImageModal);
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setChooseImageModal(!chooseImageModal);
          }}
          style={styles.touchableView}
        />
        <Pressable
          onPress={() => setChooseImageModal(!chooseImageModal)}
          style={styles.ModalContainerView}
        >
          <View style={styles.ModelContainer}>
            <Text style={styles.ModelText}>{Strings.choose}</Text>
            <View style={styles.chooseImageRowView}>
              <View style={styles.chooseImageView}>
                <Pressable
                  onPress={() => {
                    requestCameraPermissionsIfNeeded()
                      .then(() => captureImage())
                      .catch((error) => {
                        setChooseImageModal(!chooseImageModal);
                        setCameraDialogModal(true);
                      });
                  }}
                >
                  <FastImage
                    resizeMode="contain"
                    style={styles.ivChooseImageOption}
                    source={CameraIcon}
                  />
                  <Text style={styles.chooseImageOptionTxt}>
                    {Strings.camera}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.chooseImageView}>
                <Pressable
                  onPress={() => {
                    chooseFile();
                  }}
                >
                  <FastImage
                    resizeMode="contain"
                    style={styles.ivChooseImageOption}
                    source={GalleryIcon}
                  />

                  <Text style={styles.chooseImageOptionTxt}>
                    {Strings.gallery}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
      <CameraPermisionDialog
        isVisible={cameraDialogModal}
        setVisible={setCameraDialogModal}
        type={"profile"}
      />
      <Loading isVisible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.screen_bg,
  },
  safeAreaView: {
    backgroundColor: colors.screen_bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  subContainer: {
    flex: 1,
  },
  nameBorderView: {
    borderRadius: 50,
    backgroundColor: colors.app.button,
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  nameText: {
    fontSize: 32,
    color: colors.text.title,
    fontFamily: Fonts.PlusJakartaSansExtraBold,
  },
  titleText: {
    fontSize: 14,
    color: colors.takeProdText,
    fontFamily: Fonts.PlusJakartaSansRegular,
  },
  deleteText: {
    fontSize: 12,
    color: colors.red,
    fontFamily: Fonts.PlusJakartaSansBold,
    alignSelf: "center",
    marginTop: 7,
    marginBottom: 10,
  },
  inputView: {
    backgroundColor: "transparent",
    borderColor: Colors.inputBorder,
    borderWidth: 0,
    paddingHorizontal: 0,
    marginTop: 10,
    height: "auto",
  },
  textInput: {
    borderColor: Colors.inout_underline,
    borderBottomWidth: 0.5,
    paddingBottom: 10,
    fontSize: 16,
  },
  heightTextInput: {
    paddingBottom: 10,
    fontSize: 16,
  },
  placeHolderTextInput: {
    paddingBottom: 10,
    fontSize: 16,
    color: Colors.text.placeHolder,
    fontFamily: Fonts.PlusJakartaSansMedium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  buttonView: {
    marginTop: 20,
    marginBottom: 5,
  },
  profileImage: {
    borderRadius: 50,
    height: "100%",
    width: "100%",
  },
  editIconView: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  dropdown: {
    height: Platform.OS === "ios" ? 31 : 33,
    marginTop: 19,
    paddingBottom: 12,
  },
  unitDropdown: {
    height: Platform.OS === "ios" ? 31 : 33,
    paddingBottom: 12,
    alignSelf: "flex-end",
    width: 60,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.text.light,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.text.title,
    fontFamily: Fonts.PlusJakartaSansMedium,
  },
  ModelContainer: {
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 20,
    backgroundColor: "white",
    paddingVertical: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
    height: 200,
    borderRadius: 20,
  },
  ModelText: {
    color: colors.black,
    fontSize: 20,
    marginLeft: 25,
    marginTop: 10,
    fontFamily: "bold",
  },
  ModalContainerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  chooseImageRowView: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
    justifyContent: "space-evenly",
  },
  chooseImageView: { marginTop: 4, alignItems: "center" },
  ivChooseImageOption: {
    height: 50,
    width: 80,
    tintColor: Colors.black,
  },
  chooseImageOptionTxt: {
    marginTop: 8,
    color: Colors.black,
    fontSize: 16,
    alignSelf: "center",
  },

  profileRowView: {
    flexDirection: "row",
  },

  dobRowView: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  otherDetailView: {
    flex: 1,
  },
  divideView: {
    backgroundColor: Colors.inout_underline,
    flex: 1,
    height: 0.5,
  },
  touchableView: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Profile;
