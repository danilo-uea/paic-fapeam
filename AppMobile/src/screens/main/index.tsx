import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import DadosEsp32 from '../../services/sqlite/DadosEsp32';

const Main = ({ route }: any) => {
  // console.log(route.params?.name + ': ' + route.params?.id)
  const [ total, setTotal ] = useState<number>(-1)

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

  const quantidadeRegistros = () => {
    DadosEsp32.countAll()
      .then((response:any) => {
        setTotal(parseInt(response))
        console.log('Qtd: ' + response)
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

  const removerTodos = () => {
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

  const removeAll = async () => {
    Alert.alert('Perigo!', 'Deseja excluir todos os registros?', [
      { text: 'Sim', onPress: () => removerTodos() },
      { text: 'Não', onPress: () => console.log('Não deseja excluir todos os registros') }
    ])
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text style={{ fontSize: 20 }} >{ total >= 0 ? total : '' }</Text>
      <ButtonTopMenu texto='Total' tamanho='100px' onPress={() => quantidadeRegistros()} />
      <ButtonTopMenu texto='Excluir todos' tamanho='150px' onPress={() => removeAll()} />
    </View>
  );
};

export default Main;
