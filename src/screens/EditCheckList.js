import { View, Text, SafeAreaView, TextInput, Button, ScrollView, RefreshControl, Pressable, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react';
import { useUser } from '../UserProvider';
import Header from '../components/Header';
import { addressRoute, domain } from '../api/BaseURL';

const EditCheckList = ({ route }) => {
    const { user, isLogin } = useUser();
    const { item } = route.params;

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
    const [dateExpired, setDateExpired] = useState(new Date());
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

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi màn hình được tạo
        if (!isLogin()) {
            navigation.replace('Login'); // Nếu chưa đăng nhập, chuyển hướng đến màn hình đăng nhập
        }
    }, [navigation]);
    const handleQuanChange = async (value) => {
        setPhoList([])
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
        setPhoList([])
        setSelectedPhuong(value);
        // Lấy danh sách phường dựa trên quận đã chọn và cập nhật state
        const phoData = await axios.get(`${domain}${addressRoute}/pho/${value}`)
        setPhoList(phoData.data);
    };
    const handlePhoChange = async (value) => {
        setSelectedPho(value);
    };
  return (
    <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            <Header screenName="CheckList" navigation={navigation} goback={true}/>
            <ScrollView>
                <View className="flex-1 flex-col mx-2 mb-10 bg-gray-100">
                    <View className="bg-white rounded-lg shadow-md px-8 pt-6 pb-8 mb-4">
                        <Text className="text-lg text-center font-bold text-blue-500 mb-4">Thông tin khách hàng</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={item.customerName}
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
                            value={item.address}
                            onChangeText={text => setAddress(text)}
                            placeholder="Nhập địa chỉ (*)"
                        />
                        <Text className="text-red-500 mb-1">{errorAddress}</Text>
                        <TextInput
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="tel"
                            value={item.phoneNumber}
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
                            <Text className="text-base font-bold">Nhà Mạng (*)</Text>
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
                            <Text className="text-base font-bold">Thời gian đã đóng (*)</Text>
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
                        <Text className='text-base font-bold'>Thời gian hết hạn (*)</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text className="border border-gray-300 my-2 text-lg leading-9 p-2">{dateExpired.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && <DateTimePicker
                            value={dateExpired}
                            mode={'date'}
                            onChange={onChange}
                            display={'default'}
                        />}
                        <View className='my-2'>
                            <Text className='text-base font-bold'>Chọn ảnh</Text>
                            <ImagePickerComponent setImage={setImage} />
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
                            <LocationComponent onLocationChange={handleLocationChange} />
                            
                        </View>
                        {currentLatitude && currentLongitude && <MapDisplay latitude={currentLatitude} longitude={currentLongitude} isDraggable={true} handleDragEnd={handleDragEnd}/>}
                        <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 h-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline items-center mt-3">
                            <Text className='text-white font-bold text-base'>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Toast />
        </SafeAreaView>
  )
}

export default EditCheckList