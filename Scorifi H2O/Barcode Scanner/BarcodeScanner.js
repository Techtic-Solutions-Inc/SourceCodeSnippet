import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { BarcodeCapture, BarcodeCaptureSettings, Symbology } from "scandit-react-native-datacapture-barcode";
import { Camera, CameraSettings, DataCaptureContext, DataCaptureView, FrameSourceState, VideoResolution } from "scandit-react-native-datacapture-core";
import InAppReview from "react-native-in-app-review";
import { ScanDitLicenseKeyAndroid, ScanDitLicenseKeyIOS } from "@env";
import Colors from "../../../assets/colors/Colors";
import { Fonts } from "../../../assets/fonts/Fonts";
import { Strings } from "../../common/Strings";
import Toolbar from "../../components/Toolbar";
import { routes } from "../../navigation/routes";
import { callAddReviewAPI } from "../../redux/actions/userActions";
import { requestCameraPermissionsIfNeeded } from "../../utils/CameraPermissionHandler";
import { showErrorMessage, showSuccessMessage } from "../../utils/Toast";
import { generateSessionId } from "../../utils/Tools";
import { useAppState } from "../../utils/useAppState";
import Loading from "../../components/Loading";
import AppNotificationDialog from "../../components/AppNotificationDialog";
import BackIcon from "../../../assets/images/back-bg.svg";
import MenuIcon from "../../../assets/images/menu-icon.svg";

const { width, height } = Dimensions.get("window");

const BarcodeScanner = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [camera, setCamera] = useState(null);
  const [isBarcodeCaptureEnabled, setIsBarcodeCaptureEnabled] = useState(false);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);
  const [isLoader, setLoader] = useState(false);
  const viewRef = useRef(null);
  const barcodeCaptureRef = useRef(null);
  const dataCaptureContext = useMemo(() => DataCaptureContext.forLicenseKey(
    Platform.OS === "ios" ? ScanDitLicenseKeyIOS : ScanDitLicenseKeyAndroid
  ), []);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener("change", handleAppStateChange);
    setupScanning();
    startCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.removeAllModes();
    };
  }, []);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(isFocused ? FrameSourceState.On : FrameSourceState.Off);
    }
  }, [isFocused]);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") startCapture();
    else stopCamera();
  };

  const setupScanning = () => {
    const settings = new BarcodeCaptureSettings();
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.InterleavedTwoOfFive,
    ]);
    settings.codeDuplicateFilter = 1000;
    const barcodeCapture = BarcodeCapture.forContext(dataCaptureContext, settings);
    barcodeCaptureRef.current = barcodeCapture;
    viewRef.current?.addOverlay(BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, null));
  };

  const startCapture = () => {
    startCamera();
    setIsBarcodeCaptureEnabled(true);
  };

  const startCamera = () => {
    if (!camera) {
      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.UHD4K;
      const defaultCamera = Camera.withSettings(cameraSettings);
      dataCaptureContext.setFrameSource(defaultCamera);
      setCamera(defaultCamera);
    }
    requestCameraPermissionsIfNeeded().then(() => setCameraState(FrameSourceState.On));
  };

  const stopCamera = () => camera?.switchToDesiredState(FrameSourceState.Off);

  return (
    <View style={styles.mainView}>
      <SafeAreaView style={styles.safeAreaView} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.screen_bg} />
      <Toolbar
        isLeftIcon={true}
        leftIcon={<BackIcon />}
        title={Strings.profileSettings}
        textStyle={{ color: Colors.white }}
        onPress={() => navigation.goBack()}
        isRightIcon={true}
        rightIcon={
          <TouchableOpacity onPress={() => navigation.navigate(routes.ProfileSetting)}>
            <MenuIcon />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <Text style={styles.scanBarcodeText}>{Strings.scanBarcode}</Text>
        <View style={styles.dataCaptureContainer}>
          <DataCaptureView style={styles.dataCaptureView} context={dataCaptureContext} ref={viewRef} />
          <View style={styles.dataCaptureBgView} />
        </View>
      </View>
      <Loading isVisible={isLoader} />
      <AppNotificationDialog visible={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: { flex: 1, backgroundColor: Colors.screen_bg },
  safeAreaView: { backgroundColor: Colors.screen_bg },
  container: { flex: 1 },
  scanBarcodeText: {
    fontSize: 16,
    fontFamily: Fonts.PlusJakartaSansBold,
    color: Colors.white,
    alignSelf: "center",
    marginTop: 20,
  },
  dataCaptureContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: Colors.black,
  },
  dataCaptureView: { width: width * 0.75, height: height * 0.55, borderRadius: 30 },
  dataCaptureBgView: {
    backgroundColor: "transparent",
    width: width * 0.78,
    height: height * 0.56,
    position: "absolute",
    borderColor: Colors.black,
    borderWidth: 5,
  },
});

export default BarcodeScanner;
