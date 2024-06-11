import React from 'react';
import { View, StyleSheet, Platform, Linking, Button } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { api_key } from '../api/google';

const MapDisplay = ({ latitude, longitude, isDraggable, handleDragEnd, currentLatitude, currentLongitude, isButton }) => {
    const handleOpenMaps = () => {
        const destination = `${latitude},${longitude}`;
        const origin = currentLatitude && currentLongitude ? `${currentLatitude},${currentLongitude}` : null;

        let url = '';

        if (Platform.OS === 'android') {
            url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            if (origin) {
                url += `&origin=${origin}`;
            }
            console.log(url)
        } else {
            url = `http://maps.apple.com/?daddr=${destination}`;
            if (origin) {
                url += `&saddr=${origin}`;
            }
        }

        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };
    return (
        <View style={styles.container}>
            {isButton && <Button title="Chỉ đường" onPress={handleOpenMaps} />} 
            <MapView
                style={{ width: 300, height: 300 }}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                provider={MapView.PROVIDER_GOOGLE}
            >
                <Marker
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                    draggable={isDraggable}
                    onDragEnd={handleDragEnd}
                />
                {currentLatitude && currentLongitude && (
                    <Marker
                    coordinate={{
                        latitude: currentLatitude,
                        longitude: currentLongitude,
                    }}
                    title="vị trí hiện tại"
                    pinColor="blue"
                    />
                )}
                {currentLatitude && currentLongitude && (
                    
                    <MapViewDirections 
                        origin={{
                            latitude: currentLatitude,
                            longitude: currentLongitude,
                        }}
                        destination={{
                            latitude: latitude,
                            longitude: longitude,
                        }}
                        apikey={api_key}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    />
                )}

            </MapView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
});
export default MapDisplay;