import React, { useEffect } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import DadosEsp32 from '../../services/sqlite/DadosEsp32';

const Main = ({ route }: any) => {
  // console.log(route.params?.name + ': ' + route.params?.id)

  useEffect(() => {
  }, [])

  const addData = async (Contador:string, DataHora:string, Fe:string, Rssi:string, Tamanho:string, Latitude:string, Longitude:string) => {
    DadosEsp32.create(Contador, DataHora, Fe, Rssi, Tamanho, Latitude, Longitude)
      .then((response:any) => {
        Alert.alert('Messagem', response.toString())
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const listAll = () => {
    DadosEsp32.all()
      .then((response:any) => {
        response?.forEach((element:any) => {
          console.log(element)
        });
        console.log('Qtd: ' + response?.length)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const getById = (Id:number) => {
    DadosEsp32.get(Id)
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const removeId = async (Id:number) => {
    DadosEsp32.removeId(Id)
      .then((response:any) => {
        Alert.alert('Messagem', response.toString())
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const removeAll = async () => {
    DadosEsp32.removeAll()
      .then((response:any) => {
        Alert.alert('Messagem', response.toString())
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text>Início</Text>
      {/* <Button title='Teste' onPress={() => addData('Miracelma', 60, '2022-04-23 20:13')} /> */}
      {/* <Button title='Data' onPress={() => datas()} /> */}
      <Button title='Listar' onPress={() => listAll()} />
      {/* <Button title='Adicionar' onPress={() => addData(
        '1236',
        '2022-04-26 20:13:25', 
        '7',
        '-75',
        '21',
        '-3.030872',
        '-59.970642',
      )} /> */}
      {/* <Button title='Pegar Id' onPress={() => getById(3)} /> */}
      {/* <Button title='Remover' onPress={() => removeId(3)} /> */}
      <Button title='Remover Todos' onPress={() => removeAll()} />
    </View>
  );
};

export default Main;
