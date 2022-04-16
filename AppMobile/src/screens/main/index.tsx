import { ThemeProvider } from '@react-navigation/native';
import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CustomButton, CustomButtonText } from './styles';

const Main = () => {
  
  return (
    <View>
      <CustomButton onPress={() => console.log('Botão pressionado')}>
          <CustomButtonText>LOGIN</CustomButtonText>
      </CustomButton>
    </View>
  );
};

export default Main;
