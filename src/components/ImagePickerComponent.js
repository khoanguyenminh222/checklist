// ImagePicker.js
import React, { useState, useEffect  } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ImagePickerComponent = ({ setImage }) => {

  useEffect(() => {
    (async () => {
      // Đảm bảo quyền truy cập camera và thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Bạn cần cấp quyền truy cập để sử dụng chức năng chọn ảnh');
      }
    })();
  }, []);

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={takePhoto} className='mt-2 p-2 rounded-sm items-center bg-blue-500 hover:bg-blue-600'>
          <Text className='text-white font-bold'>Chụp ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={selectImage} className='my-2 p-2 rounded-sm items-center bg-blue-500 hover:bg-blue-600'>
          <Text className='text-white font-bold'>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>
    </>
  );
};

export default ImagePickerComponent;
