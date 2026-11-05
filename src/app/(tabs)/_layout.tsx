import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { cores } from '../../theme';

function icone(nome: SymbolViewProps['name']) {
  function IconeAba({ color, size }: { color: ColorValue; size: number }) {
    return <SymbolView name={nome} tintColor={color} size={size} />;
  }
  return IconeAba;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: cores.primaria }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: icone({ ios: 'house', android: 'home', web: 'home' }) }}
      />
      <Tabs.Screen
        name="criar"
        options={{
          title: 'Criar',
          tabBarIcon: icone({ ios: 'plus.circle', android: 'add_circle', web: 'add_circle' }),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: icone({ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: icone({ ios: 'person.crop.circle', android: 'person', web: 'person' }),
        }}
      />
    </Tabs>
  );
}
