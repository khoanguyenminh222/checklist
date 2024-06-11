import { View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useUser } from '../UserProvider';
import { addressRoute, domain, listSubmitRoute } from '../api/BaseURL';
import Header from '../components/Header';
import axios from 'axios';
import MapView, { Marker, Circle, PROVIDER_GOOGLE  } from 'react-native-maps';
import DropdownComponent from '../components/DropdownComponent';
import Toast from 'react-native-toast-message';
import { api_key } from '../api/google';
import * as Location from 'expo-location';

const CustomerMap = ({ navigation }) => {
    const { user, isLogin } = useUser();
    const [listSubmit, setListSubmit] = useState([]);
    const [nearbySubmissions, setNearbySubmissions] = useState([]);
    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const response = await axios.get(`${domain}${listSubmitRoute}/getAllCustomer`)
                setListSubmit(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchList();

    }, [])

    // chọn phường quận
    const [quanList, setQuanList] = useState([]);
    const [selectedQuan, setSelectedQuan] = useState(null);
    const [phuongList, setPhuongList] = useState([]);
    const [selectedPhuong, setSelectedPhuong] = useState(null);
    const [region, setRegion] = useState({
        latitude: 10.35411,
        longitude: 107.09470,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    useEffect(() => {
        fetchQuan();
    }, []);

    const fetchQuan = async () => {
        try {
            const response = await axios.get(`${domain}${addressRoute}/quan`);
            if (user && user.codeDistrict && Array.isArray(user.codeDistrict) && user.codeDistrict.length > 0) {
                const uniqueQuanIds = [...new Set(user.codeDistrict.map(item => item.idQuan))];
                const filteredQuanData = response.data.filter(quan => uniqueQuanIds.includes(quan.idQuan));
                setQuanList(filteredQuanData);
            } else {
                setQuanList(response.data);
            }
        } catch (error) {
            console.error('Error fetching quan list:', error);
        }
    }

    const handleQuanChange = async (value) => {
        setPhuongList([])
        // Cập nhật quận được chọn
        setSelectedQuan(value);
        try {
            // Lấy danh sách phường dựa trên quận đã chọn và cập nhật state
            if (user && user.codeDistrict && Array.isArray(user.codeDistrict) && user.codeDistrict.length > 0) {
                const phuongInfoObject = [];
                const phuongResponse = await axios.get(`${domain}${addressRoute}/phuong/${value}`);
                const phuongData = phuongResponse.data;
                // Lọc các ID phường trong mỗi quận dựa trên user.codeDistrict
                const quanPhuongIds = user.codeDistrict
                    .filter(item => item.idQuan === value)
                    .map(item => item.idPhuong);
                // Lọc thông tin phường dựa trên các ID phường đã lấy được
                const filteredPhuongData = phuongData.filter(phuong => quanPhuongIds.includes(phuong.idPhuong));

                // Lưu thông tin phường
                phuongInfoObject.push(...filteredPhuongData);
                setPhuongList(phuongInfoObject);
            } else {
                const phuongData = await axios.get(`${domain}${addressRoute}/phuong/${value}`)
                setPhuongList(phuongData.data);
            }
        } catch (error) {
            console.log(error)
        }

    };
    const handlePhuongChange = async (value) => {
        setSelectedPhuong(value);
    };

    // Hàm xử lý khi nhấn nút để tìm vị trí
    const handleFindLocation = async () => {

        if(!selectedQuan || !selectedPhuong){
            Toast.show({
                type: 'error',
                text1: 'Yêu cầu chọn quận, phường',
              });
            return;
        }
        try {
            const addressQuan = await axios.get(`${domain}${addressRoute}/quan/${selectedQuan}`)
            const addressPhuong = await axios.get(`${domain}${addressRoute}/phuong/getById/${selectedPhuong}`)
            const address = `${addressPhuong.data.tenPhuong}, ${addressQuan.data.tenQuan}`;

            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${api_key}`);
            const data = await response.json();
            if (data.results.length > 0) {
                const location = data.results[0].geometry.location;
                setSelectedLocation({
                    latitude: parseFloat(location.lat),
                    longitude: parseFloat(location.lng)
                });
            } else {
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm vị trí:', error);
        }
    };

    useEffect(() => {
        const getLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Quyền truy cập vị trí bị từ chối');
                    return;
                }
                let location = await Location.getCurrentPositionAsync({});
                setSelectedLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                setErrorMsg('Yêu cầu vị trí không thành công. Vui lòng kiểm tra cài đặt của thiết bị.');
            }
        };
        getLocation();

        
    }, [])

    useEffect(() => {
        if (selectedLocation) {
            setRegion({
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
            });
            filterNearbySubmissions();
        }
    }, [selectedLocation, listSubmit]);
    const filterNearbySubmissions = async () => {
        if (selectedLocation) {
            const nearby = await Promise.all(
                listSubmit.map(async (item) => {
                    const distance = calculateDistance(
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                        item.location.latitude,
                        item.location.longitude
                    );
                    if (distance <= 0.5) {
                        try {
                            // Lấy thông tin về quận từ API
                            const quanResponse = await axios.get(`${domain}${addressRoute}/quan/${item.idQuan}`);
                            const quanName = quanResponse.data.tenQuan; // Giả sử bạn có trường name trong mô hình quận
    
                            // Lấy thông tin về phường từ API
                            const phuongResponse = await axios.get(`${domain}${addressRoute}/phuong/getById/${item.idPhuong}`);
                            const phuongName = phuongResponse.data.tenPhuong; // Giả sử bạn có trường name trong mô hình phường
    
                            // Lấy thông tin về phố từ API
                            const phoResponse = await axios.get(`${domain}${addressRoute}/pho/getById/${item.idPho}`);
                            const phoName = phoResponse.data.tenPho; // Giả sử bạn có trường name trong mô hình phố
    
                            // Thêm tên của quận, phường và phố vào mục
                            return {
                                ...item,
                                tenQuan: quanName,
                                tenPhuong: phuongName,
                                tenPho: phoName
                            };
                        } catch (error) {
                            console.error('Lỗi khi lấy thông tin địa chỉ:', error);
                            return null;
                        }
                    }
                    return null;
                })
            );
            const filteredNearby = nearby.filter(Boolean); // Lọc bỏ các mục null
            setNearbySubmissions(filteredNearby);
        }
    };
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (value) => (value * Math.PI) / 180;
        const earthRadius = 6371e3; // Earth's radius in meters

        const lat1InRadians = toRadians(lat1);
        const lat2InRadians = toRadians(lat2);
        const deltaLat = toRadians(lat2 - lat1);
        const deltaLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1InRadians) * Math.cos(lat2InRadians) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = earthRadius * c / 1000; // Convert to kilometers
        return distance;
    };
    const handleDragEnd = (e) => {
        setSelectedLocation({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
        });
        filterNearbySubmissions();
    };
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <Header screenName="Khách hàng" navigation={navigation} />

            <View className="flex justify-center items-center">
                <View className="w-11/12">
                    <DropdownComponent
                        labelField="tenQuan"
                        valueField="idQuan"
                        placeholder="Chọn quận"
                        data={quanList}
                        onChange={handleQuanChange}
                    />
                    <DropdownComponent
                        labelField="tenPhuong"
                        valueField="idPhuong"
                        placeholder="Chọn phường"
                        data={phuongList}
                        onChange={handlePhuongChange}
                    />

                    <TouchableOpacity className="mt-1 bg-blue-500 p-3 rounded-md items-center mb-3" onPress={handleFindLocation}>
                        <Text className="text-white text-lg font-semibold">Tìm vị trí</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1">
                <MapView
                    style={{ flex: 1 }}
                    region={region}
                    provider={PROVIDER_GOOGLE}
                    showsMyLocationButton={true}
                    showsUserLocation={true}
                >
                    {nearbySubmissions.map((li, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: li.location.latitude, longitude: li.location.longitude }}
                            title={`Khách hàng: ${li.customerName} của ${li.userId.username}`}
                            description={`${li.address}, ${li.tenPho}, ${li.tenPhuong}, ${li.tenQuan}`}
                            pinColor="green"
                        />
                    ))}
                    {selectedLocation && (
                        <>
                        <Marker
                            coordinate={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                            title="Selected Location"
                            draggable
                            onDragEnd={handleDragEnd}
                        />
                        <Circle
                            center={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                            radius={500} // radius in meters
                            strokeWidth={1}
                            strokeColor={'#1a66ff'}
                            fillColor={'rgba(230,238,255,0.5)'}
                        />
                        </>
                    )}
                    
                </MapView>
            </View>
            <Toast />
        </SafeAreaView>
    )
}

export default CustomerMap