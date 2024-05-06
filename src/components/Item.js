import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, } from 'react'
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons'

const Item = ({work, index}) => {
    const [isChecked, setChecked] = useState(false);
    useEffect(() => {
        setChecked(work.isChecked); // Đặt isChecked thành false khi một work mới được truyền vào
    }, [work]);
    return (
        <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
            onPress={() => setChecked(!isChecked)} // Khi người dùng chạm vào item, cập nhật trạng thái isChecked
        >
            <Checkbox
                color={isChecked ? '#3b82f6' : undefined}
                value={isChecked}
                onValueChange={setChecked} // Khi giá trị của ô checkbox thay đổi, cập nhật trạng thái isChecked
            />
            <Text style={{ marginLeft: 10 }}>{index + 1}. {work.name}</Text>
        </TouchableOpacity>
    )
}

export default Item