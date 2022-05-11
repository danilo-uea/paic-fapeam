import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { useNavigation } from '@react-navigation/native'
import { propsStack } from '../../stacks/models'
import ButtonTopMenu from "../../components/ButtonTopMenu"
import InputName from "../../components/InputName"

const Export = ({ route }: any) => {
    const [dataInicial] = useState<string>(route.params?.dataInicial)
    const [dataFinal] = useState<string>(route.params?.dataFinal)
    const navigation = useNavigation<propsStack>()
    const [nome, setNome] = useState<string>('')

    useEffect(() => {
        console.log(dataInicial, dataFinal)
    }, [dataInicial, dataFinal])

    const gerarArquivo = () => {
        
    }

    return (
        <View style={{ marginRight: 8, marginLeft: 8 }}>
            <Text></Text>
            <InputName
                placeholder="Digite um nome"
                value={nome}
                onChangeText={(t:string) => setNome(t)}
            />
            <Text></Text>
            <ButtonTopMenu texto='Gerar Arquivo' tamanho='150px' onPress={() => {  }} />
            <Text></Text>
            <ButtonTopMenu texto='Voltar' tamanho='100px' onPress={() => navigation.navigate('Pagination')} />
        </View>
    )
}

export default Export
