import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';

const LocationComponent = ({onLocationChange}) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Quyền truy cập vị trí bị từ chối');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location); // Lưu vị trí vào state
        onLocationChange(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Yêu cầu vị trí không thành công. Vui lòng kiểm tra cài đặt của thiết bị.');
      }
    };
  
    getLocation();
  }, []);

  let text = 'Đang xác định vị trí...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Vị trí hiện tại của bạn: ${location.coords.latitude}, ${location.coords.longitude}`;
  }
  return (
    <View className='mt-2'>
      <Text>{text}</Text>
    </View>
  );
};

export default LocationComponent;
