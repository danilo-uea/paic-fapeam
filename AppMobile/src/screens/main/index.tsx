import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Main = () => {
  return (
    <View style={styles.sectionContainer}>
      <Text>
        Texto
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default Main;
