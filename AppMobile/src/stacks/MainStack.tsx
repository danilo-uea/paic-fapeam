import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Main from '../screens/main'

const Stack = createNativeStackNavigator();

export default () => (
    <Stack.Navigator
        initialRouteName="main"
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen name="Main" component={Main} />
    </Stack.Navigator>
);