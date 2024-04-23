import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import Checkbox from 'expo-checkbox';

const Item = ({work, index, onCheckboxChange}) => {
    const [isChecked, setChecked] = useState(false);
    useEffect(() => {
        setChecked(false); // Đặt isChecked thành false khi một work mới được truyền vào
    }, [work]);
    return (
        <View className="flex flex-row items-center justify-items-start my-2 pr-5">
            <Checkbox
                className="my-2 mr-3"
                value={isChecked}
                onValueChange={newValue => {
                    setChecked(newValue);
                    onCheckboxChange(newValue, work._id);
                }}
                color={isChecked ? 'blue' : undefined}
            />
            <Text className="text-sm">{index+1}. {work.name}</Text>
        </View>
    )
}

export default Item