import { View, Text, SafeAreaView, TextInput, Button, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import DropdownComponent from '../components/DropdownComponent';
import validator from 'validator';
import Item from '../components/Item';
import Header from '../components/Header';
import { useUser } from '../UserProvider';
import { addressRoute, checklistRoute, domain, listSubmitRoute } from '../api/BaseURL';
import axios from 'axios';
import ToastMesssage from '../components/ToastMessage';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePickerComponent from '../components/ImagePickerComponent';
import LocationComponent from '../components/LocationComponent';

const CheckList = ({ navigation }) => {
    const { user, isLogin } = useUser();
    const [name, setName] = useState('');
    const [quanList, setQuanList] = useState([]);
    const [selectedQuan, setSelectedQuan] = useState(null);
    const [phuongList, setPhuongList] = useState([]);
    const [selectedPhuong, setSelectedPhuong] = useState(null);
    const [phoList, setPhoList] = useState([]);
    const [selectedPho, setSelectedPho] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [vnptAccount, setVnptAccount] = useState('');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [errorName, setErrorName] = useState('');
    const [errorQuan, setErrorQuan] = useState('');
    const [errorPhuong, setErrorPhuong] = useState('');
    const [errorPhoneNumber, setErrorPhoneNumber] = useState('');
    const [errorAddress, setErrorAddress] = useState('');
    const [errorPaymentTime, setErrorPaymentTime] = useState('');
    const [errorLocation, setErrorLocation] = useState('');
    const [message, setMessage] = useState('');
    const [workList, setWorkList] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [paymentTime, setPaymentTime] = useState(null);
    const [image, setImage] = useState(null);
    const [currentLatitude, setCurrentLatitude] = useState(null); // State để lưu trữ vĩ độ
    const [currentLongitude, setCurrentLongitude] = useState(null); // State để lưu trữ kinh độ

    const handleQuanChange = async (value) => {
        setPhoList([])
        setPhuongList([])
        // Cập nhật quận được chọn
        setSelectedQuan(value);
        // Lấy danh sách phường dựa trên quận đã chọn và cập nhật state
        const phuongData = await axios.get(`${domain}${addressRoute}/phuong/${value}`)
        setPhuongList(phuongData.data);
        
    };
    const handlePhuongChange = async (value) => {
        setPhoList([])
        setSelectedPhuong(value);
        // Lấy danh sách phường dựa trên quận đã chọn và cập nhật state
        const phoData = await axios.get(`${domain}${addressRoute}/pho/${value}`)
        setPhoList(phoData.data);
    };
    const handlePhoChange = async (value) => {
        setSelectedPho(value);
    };

    const handleLocationChange = (latitude, longitude) => {
        if (latitude && longitude){
            setCurrentLatitude(latitude); // Cập nhật vĩ độ
            setCurrentLongitude(longitude); // Cập nhật kinh độ
        }
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        navigation.reset({
            index: 0, // Chỉ định màn hình đầu tiên trong danh sách
            routes: [{ name: 'CheckList' }],
        });
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const handleCheckboxChange = (isChecked, workId) => {
        if (isChecked) {
            // Nếu checkbox được check và workId chưa có trong mảng checkedItems, thêm vào danh sách checkedItems
            if (!checkedItems.includes(workId)) {
                setCheckedItems(prevState => [...prevState, workId]);
            }
        } else {
            // Nếu checkbox được uncheck, loại bỏ workId khỏi danh sách checkedItems
            setCheckedItems(prevState => prevState.filter(id => id !== workId));
        }
    };

    useEffect(() => {
        fetchWorkList();
        fetchQuan();
    }, []);

    const fetchQuan = async () => {
        try {
            const response = await axios.get(`${domain}${addressRoute}/quan`);
            setQuanList(response.data);
        } catch (error) {
            console.error('Error fetching quan list:', error);
        }
    }

    const fetchWorkList = async () => {
        try {
            const response = await axios.get(`${domain}${checklistRoute}`);
            setWorkList(response.data);
        } catch (error) {
            console.error('Error fetching work list:', error);
        }
    };

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);

    const networks = ['Viettel', 'SCTV', 'FPT', 'Nhà mạng khác'];
    const handleNetworkSelection = (network) => {
        if (selectedNetwork === network) {
            // Nếu mạng đã được chọn trước đó, gỡ bỏ chọn
            setSelectedNetwork(null);
        } else {
            // Nếu mạng chưa được chọn hoặc mạng mới được chọn, cập nhật state với mạng mới
            setSelectedNetwork(network);
        }
    };

    const times = ['Theo tháng', 'Theo quý', 'Theo năm'];
    const handlePaymentTimeSelection = (time) => {
        if(paymentTime === time){
            setPaymentTime(null);
        } else {
            setPaymentTime(time);
        }
    };

    const handleSubmit = async () => {
        try {
            // Kiểm tra xem các trường nhập liệu có giá trị null không
            if (!name) {
                setErrorName('Vui lòng điền tên khách hàng');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorName('');
            }
            if (!selectedQuan) {
                setErrorQuan('Vui lòng chọn quận');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorQuan('');
            }
            if (!selectedPhuong) {
                setErrorPhuong('Vui lòng chọn phường');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorPhuong('');
            }
            if (!phoneNumber) {
                setErrorPhoneNumber('Vui lòng điền số điện thoại');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorPhoneNumber('')
            }
            // Kiểm tra xem số điện thoại có hợp lệ không
            if (!validator.isMobilePhone(phoneNumber, 'vi-VN')) {
                setErrorPhoneNumber('Số điện thoại không hợp lệ');
                return; // Kết thúc hàm nếu số điện thoại không hợp lệ
            } else {
                setErrorPhoneNumber('')
            }
            if (!address) {
                setErrorAddress('Vui lòng điền địa chỉ');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorAddress('')
            }
            if (checkedItems.length === 0) {
                setMessage('Vui lòng chọn ít nhất một mục công việc');
                return;
            } else {
                setMessage('');
            }
            if (!paymentTime) {
                setErrorPaymentTime('Vui lòng chọn thời gian đóng');
                return; // Kết thúc hàm nếu có trường nhập liệu không có giá trị
            } else {
                setErrorPaymentTime('')
            }
            if(!currentLatitude && !currentLongitude){
                setErrorLocation('Không thể truy cập vị trí hiện tại');
                return;
            } else {
                setErrorLocation('')
            }
            
            // Dữ liệu để gửi đi
            const formData = new FormData();
            formData.append('customerName', name);
            formData.append('idQuan', selectedQuan);
            formData.append('idPhuong', selectedPhuong);
            formData.append('idPho', selectedPho || '');
            formData.append('phoneNumber', phoneNumber);
            formData.append('address', address);
            formData.append('vnptAccount', vnptAccount);
            formData.append('checkedItems', checkedItems)
            formData.append('networks', selectedNetwork || '');
            formData.append('paymentTime', paymentTime);
            formData.append('date', date.toString());
            formData.append('note', note);
            formData.append('userId', user._id);
            formData.append('location[latitude]', currentLatitude);
            formData.append('location[longitude]', currentLongitude);
            if(image){
                formData.append('image', {
                    uri: image,
                    name: 'image.jpg',
                    type: 'image/jpeg',
                });
            }
            console.log(formData._parts)
            const response = await axios.post(`${domain}${listSubmitRoute}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setMessage("Gửi thông tin thành công")
                onRefresh()
            } else {
                console.error('Submission failed with status:', response.status);
            }
        } catch (error) {
            setMessage("Error Submitting")
            console.log(error)
        }
        // Thực hiện các thao tác khác như lưu dữ liệu vào cơ sở dữ liệu, gửi dữ liệu đến máy chủ, vv.
    };
    return (
        <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            <Header screenName="CheckList" navigation={navigation} />
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />}
            >
                <View className="flex-1 flex-col mx-2 mb-10 bg-gray-100">
                    <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8 mb-4">
                        <Text className="text-lg text-center font-bold text-blue-500 mb-4">Thông tin khách hàng</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={name}
                            onChangeText={text => setName(text)}
                            placeholder="Nhập tên khách hàng (*)"
                        />
                        <Text className="text-red-500 mb-1">{errorName}</Text>
                        <View className=''>
                            <DropdownComponent
                                labelField="tenQuan"
                                valueField="idQuan"
                                placeholder="Chọn quận (*)"
                                data={quanList}
                                onChange={handleQuanChange}
                            />
                        </View>
                        <Text className="text-red-500 mb-1">{errorQuan}</Text>
                        <View className=''>
                            <DropdownComponent
                                labelField="tenPhuong"
                                valueField="idPhuong"
                                placeholder="Chọn phường (*)"
                                data={phuongList}
                                onChange={handlePhuongChange}
                            />
                        </View>
                        <Text className="text-red-500 mb-1">{errorPhuong}</Text>
                        <View className='mb-6'>
                            <DropdownComponent
                                labelField="tenPho"
                                valueField="idPho"
                                placeholder="Chọn phố"
                                data={phoList}
                                onChange={handlePhoChange}
                            />
                        </View>
                        
                        
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={address}
                            onChangeText={text => setAddress(text)}
                            placeholder="Nhập địa chỉ (*)"
                        />
                        <Text className="text-red-500 mb-1">{errorAddress}</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="tel"
                            value={phoneNumber}
                            onChangeText={text => setPhoneNumber(text)}
                            placeholder="Nhập số điện thoại (*)"
                            keyboardType='phone-pad'
                        />
                        <Text className="text-red-500 mb-1">{errorPhoneNumber}</Text>
                        
                        <TextInput
                            className="border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={vnptAccount}
                            onChangeText={text => setVnptAccount(text)}
                            placeholder="Nhập tài khoản VNPT (nếu có)"
                        />

                    </View>
                    <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8">
                        <Text className="text-base text-center font-bold text-blue-500 mb-4">Nội dung công việc đến nhà khách hàng</Text>
                        {/* Đây là chỗ fetch item */}
                        {workList.map((work, index) =>
                            work.status == 0 &&
                            (<Item key={work._id} work={work} index={workList.filter(work => work.status === 0).indexOf(work)} onCheckboxChange={handleCheckboxChange} />)
                        )}
                        <View className='my-2'>
                            <Text className="text-base font-bold">Nhà Mạng</Text>
                            {networks.map((network, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className='flex-row items-center mt-2'
                                    onPress={() => handleNetworkSelection(network)}
                                >
                                    <View className='h-5 w-5 border border-gray rounded mr-3'>
                                        {selectedNetwork === network && (
                                            <View className='flex-1 items-center justify-center'>
                                                <View className='h-2 w-2 bg-blue-500 rounded-full' />
                                            </View>
                                        )}
                                    </View>
                                    <Text className='text-base'>{network}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className='my-2'>
                            <Text className="text-base font-bold">Thời gian đóng (*)</Text>
                            {times.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className='flex-row items-center mt-2'
                                    onPress={() => handlePaymentTimeSelection(time)}
                                >
                                    <View className='h-5 w-5 border border-gray rounded mr-3'>
                                        {paymentTime === time && (
                                            <View className='flex-1 items-center justify-center'>
                                                <View className='h-2 w-2 bg-blue-500 rounded-full' />
                                            </View>
                                        )}
                                    </View>
                                    <Text className='text-base'>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text className="text-red-500 mb-1">{errorPaymentTime}</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text className="border border-gray-300 my-2 text-lg leading-9 p-2">{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && <DateTimePicker
                            value={date}
                            mode={'date'}
                            onChange={onChange}
                            display={'default'}
                        />}
                        <View className='my-2'>
                            <Text className='text-base font-bold'>Chọn ảnh</Text>
                            <ImagePickerComponent setImage={setImage}/>
                            {image && (
                                <View className='flex items-center justify-center'>
                                    <Image
                                        source={{ uri: image }}
                                        className='w-40 h-40 rounded-md'
                                    />
                                </View>
                            )}
                        </View>
                        
                        <TextInput
                            value={note}
                            onChangeText={(text) => setNote(text)}
                            placeholder="Ghi chú"
                            className="border border-gray-300 my-2 text-lg leading-9 p-2"
                            multiline={true}
                            numberOfLines={4}
                        />
                        <View className='mb-2'>
                            <LocationComponent onLocationChange={handleLocationChange}/>
                        </View>
                        
                        <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 h-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline items-center">
                            <Text className='text-white font-bold text-base'>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                    {errorName && <ToastMesssage message={errorName} time={1500} />}
                    {errorQuan && <ToastMesssage message={errorQuan} time={1500} />}
                    {errorPhuong && <ToastMesssage message={errorPhuong} time={1500} />}
                    {errorPhoneNumber && <ToastMesssage message={errorPhoneNumber} time={1500} />}
                    {errorAddress && <ToastMesssage message={errorAddress} time={1500} />}
                    {errorPaymentTime && <ToastMesssage message={errorPaymentTime} time={1500} />}
                    {errorLocation && <ToastMesssage message={errorLocation} time={1500} />}
                    {message && <ToastMesssage message={message} time={1500} />}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default CheckList