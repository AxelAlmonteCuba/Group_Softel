import { View, Text, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles';


const UserTopBarr = () => {
  return (
    <View style={styles.topBar}>

      {/* Grupo izquierdo: Imagen y textos */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View>
          <Image source={require('@assets/images/logo_login.jpg')} style={styles.imageProfile} />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.titleHome}>Hola, Juan Perez</Text>
          <Text style={styles.subtitle}>Administrador - gerencia</Text>
        </View>
      </View>

      {/* Grupo derecho: Ícono */}
      <View style={{ justifyContent: 'center' }}>
        <Ionicons name="notifications-outline" size={24} color={colors.primary} />
      </View>

    </View>
  )
}

export default UserTopBarr
