import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Main = ({ route }: any) => {
  
  console.log('Route: ' + route.params?.id)

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text>Início</Text>
    </View>
  );
};

export default Main;
