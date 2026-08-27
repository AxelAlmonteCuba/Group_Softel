import { View, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';

const UserTopBarr = () => {
  const usuario = useAuthStore(state => state.usuario);

  const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario';
  const cargoRol = usuario ? `${usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1).toLowerCase()} - ${usuario.cargo}` : 'Cargando...';

  return (
    <View style={stylesComponents.topBar}>

      {/* Grupo izquierdo: Imagen y textos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
        <View>
          <Image source={require('@assets/images/logo_login.jpg')} style={stylesComponents.imageProfile} />
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={stylesTexts.titleHome} numberOfLines={1}>Hola, {nombreCompleto}</Text>
          <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]}>{cargoRol}</Text>
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
