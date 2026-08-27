import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
    onBack?: () => void;
}

const GestionUsusariosScreen = ({ onBack }: Props) => {
    return (
        <View style={styles.container}>
            <Text>GestionUsusariosScreen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default GestionUsusariosScreen