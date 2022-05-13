import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import ButtonTopMenu from '../../components/ButtonTopMenu';
import DadosEsp32 from '../../services/sqlite/DadosEsp32';

const Main = () => {
  const [ total, setTotal ] = useState<number>(-1)

  const quantidadeRegistros = () => {
    DadosEsp32.countAll()
      .then((response:any) => {
        setTotal(parseInt(response))
        console.log('Qtd: ' + response)
      })
      .catch(err => {
        Alert.alert('Erro', err.message.toString())
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
        Alert.alert('Erro', err.message.toString())
        console.log(err)
      })
  }

  const removeAll = async () => {
    Alert.alert('Perigo!', 'Deseja excluir todos os registros?', [
      { text: 'Sim', onPress: () => removerTodos() },
      { text: 'Não', onPress: () => console.log('Não deseja excluir todos os registros') }
    ])
  }

  const gerarArquivoTxt = () => {
    // require the module
    var RNFS = require('react-native-fs');

    var path = RNFS.ExternalStorageDirectoryPath + '/Download/test5.txt';

    // write the file
    RNFS.writeFile(path, 'Testando esta escrita\nTestando de novo', 'utf8')
      .then((success:any) => {
        console.log('Criado com sucesso: ' + path)
      })
      .catch((err:any) => {
        console.log(err.message);
      });
  }

  const listarArquivo = () => {
    var RNFS = require('react-native-fs');

    RNFS.readDir(RNFS.ExternalStorageDirectoryPath +  '/Download/')
      .then((result:any) => {
        result.forEach((element:any) => {
          console.log(element.path)
        });
      })
      .catch((err:any) => {
        console.log(err.message, err.code);
      });
  }

  const deletarArquivo = () => {
    var RNFS = require('react-native-fs');
    
    RNFS.readDir(RNFS.ExternalStorageDirectoryPath +  '/Download/')
      .then((result: any) => {
        result.forEach((element: any) => {
          RNFS.unlink(element.path)
            .then(() => {
              console.log('Arquivo deletado: ' + element.name);
            })
            .catch((err: any) => {
              console.log(err.message);
            });
        });
      })
      .catch((err:any) => {
        console.log(err.message, err.code);
      });
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text style={{ fontSize: 20 }} >{ total >= 0 ? total : '' }</Text>
      <ButtonTopMenu texto='Total' tamanho='100px' onPress={() => quantidadeRegistros()} />
      <ButtonTopMenu texto='Excluir todos' tamanho='150px' onPress={() => removeAll()} />
      <ButtonTopMenu texto='Gerar Arquivo' tamanho='150px' onPress={() => gerarArquivoTxt()} />
      <ButtonTopMenu texto='Listar Arquivo' tamanho='160px' onPress={() => listarArquivo()} />
      <ButtonTopMenu texto='Deletar Arquivos' tamanho='160px' onPress={() => deletarArquivo()} />
    </View>
  );
};

export default Main;
