import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';

const DropdownComponent = ({ labelField, valueField, placeholder, data, onChange }) => {
  const [value, setValue] = useState(null)

  const handleChange = (item) => {
    setValue(item.value);
    if (onChange) {
      onChange(item.value); // Gọi hàm callback và truyền giá trị của mục đã chọn
    }
  };

  const renderItem = item => {
    return (
      <View className="py-2 px-3">
        <Text>{item.label}</Text>
      </View>
    )
  }
  return (
    <Dropdown
      className="border rounded w-full py-1 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
      labelField={valueField}
      valueField={valueField}
      maxHeight={300}
      placeholder={placeholder}
      search
      searchPlaceholder='Tìm kiếm...'
      data={data}
      value={value}
      onChange={handleChange}
      renderItem={renderItem}
    />
  )
}

export default DropdownComponent