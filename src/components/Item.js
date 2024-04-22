import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Checkbox from 'expo-checkbox';

const Item = () => {
    const [isChecked, setChecked] = useState(false);
    return (
        <View className="flex flex-row items-center my-2">
            <Checkbox
                className="m-2"
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? '#4630EB' : undefined}
            />
            <Text className="text-sm">Custom colored checkbox</Text>
        </View>
    )
}

export default Item