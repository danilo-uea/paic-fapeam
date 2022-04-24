import React, { useEffect } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import Dados from '../../services/sqlite/Dados';

const Main = ({ route }: any) => {
  // console.log(route.params?.name + ': ' + route.params?.id)

  useEffect(() => {
  }, [])

  const addData = async (Nome:string, Idade:number, DataInicial:string) => {
    Dados.create(Nome, Idade, DataInicial)
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
    Dados.all()
      .then((response:any) => {
        response.forEach((element:any) => {
          console.log(element)
        });
        console.log('')
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const getById = (Id:number) => {
    Dados.get(Id)
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const removeId = async (Id:number) => {
    Dados.remove(Id)
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
    Dados.removeAll()
      .then((response:any) => {
        Alert.alert('Messagem', response.toString())
        console.log(response)
      })
      .catch(err => {
        Alert.alert('Erro', err)
        console.log(err)
      })
  }

  const datas = async () => {
    Dados.datas()
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
      <Button title='Adicionar' onPress={() => addData('Miracelma', 60, '2022-04-26 20:13:25')} />
      {/* <Button title='Pegar Id' onPress={() => getById(7)} /> */}
      {/* <Button title='Remover' onPress={() => removeId(7)} /> */}
      {/* <Button title='Remover Todos' onPress={() => removeAll()} /> */}
    </View>
  );
};

export default Main;
