import React, { useState, useEffect } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import DateTimeInput from '../../components/DateTimeInput';
import { ViewHorizontal } from './styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import DadosEsp32 from '../../services/sqlite/DadosEsp32';
import ButtonTopMenu from '../../components/ButtonTopMenu';

const Pagination = ({ route }: any) => {
    // console.log(route.params?.name + ': ' + route.params?.id)
    const [ listagem, setListagem ] = useState<any>([]);

    const [dateStart, setDateStart] = useState(new Date());
    const [dataInicialBr, setDataInicialBr] = useState<string>('');
    const [horaInicialBr, setHoraInicialBr] = useState<string>('');

    const [dateEnd, setDateEnd] = useState(new Date());
    const [dataFinalBr, setDataFinalBr] = useState<string>('');
    const [horaFinalBr, setHoraFinalBr] = useState<string>('');

    const [modeInicial, setModeInicial] = useState<any>('date');
    const [modeFinal, setModeFinal] = useState<any>('date');
    const [showInicial, setShowInicial] = useState(false);
    const [showFinal, setShowFinal] = useState(false);

    useEffect(() => {
        onChangeInicial('', dateStart);
        onChangeFinal('', dateEnd);
    }, [dateStart, dateEnd]);

    const onChangeInicial = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateStart;
        setShowInicial(Platform.OS === 'ios')
        setDateStart(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = DadosEsp32.zeroEsquerda(tempDate.getDate()) + '/' + DadosEsp32.zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = DadosEsp32.zeroEsquerda(tempDate.getHours()) + ':' + DadosEsp32.zeroEsquerda(tempDate.getMinutes());

        setDataInicialBr(fDate);
        setHoraInicialBr(fTime);
    }

    const onChangeFinal = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || dateEnd;
        setShowFinal(Platform.OS === 'ios')
        setDateEnd(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = DadosEsp32.zeroEsquerda(tempDate.getDate()) + '/' + DadosEsp32.zeroEsquerda(tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        let fTime = DadosEsp32.zeroEsquerda(tempDate.getHours()) + ':' + DadosEsp32.zeroEsquerda(tempDate.getMinutes());

        setDataFinalBr(fDate);
        setHoraFinalBr(fTime);
    }

    const showModeInicial = (currentMode: string) => {
        setShowInicial(true);
        setModeInicial(currentMode);
    }

    const showModeFinal = (currentMode: string) => {
        setShowFinal(true);
        setModeFinal(currentMode);
    }

    const listDataHora = (DataInicial:Date, DataFinal:Date) => {
        let dataInicial = DadosEsp32.formatoDataFiltro(DataInicial);
        let dataFinal = DadosEsp32.formatoDataFiltro(DataFinal);

        DadosEsp32.allDateTime(dataInicial, dataFinal)
            .then((response: any) => {
                response?.forEach((element: any) => {
                    console.log(element)
                });
                console.log('Qtd: ' + response?.length)
                setListagem(response)
            })
            .catch(err => {
                Alert.alert('Erro', err.message.toString())
                console.log(err)
            })
    }

    const removerDataHora = (DataInicial:Date, DataFinal:Date) => {
        Alert.alert('Perigo!', 'Deseja excluir todos os registros?', [
            {
                text: 'Sim', onPress: () => {
                    let dataInicial = DadosEsp32.formatoDataFiltro(DataInicial);
                    let dataFinal = DadosEsp32.formatoDataFiltro(DataFinal);

                    DadosEsp32.removeDateTime(dataInicial, dataFinal)
                        .then((response: any) => {
                            Alert.alert('Messagem', response.toString())
                            console.log(response)
                        })
                        .catch(err => {
                            Alert.alert('Erro', err.message.toString())
                            console.log(err)
                        })
                }
            },
            { text: 'Não', onPress: () => console.log('Não deseja excluir todos os registros') }
        ]);
    }

    return (
        <View>
            <ViewHorizontal>
                <View style={{ marginRight: 10 }}>
                    <Text>Inicial</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto={dataInicialBr}
                            tamanho="110px"
                            onPress={() => { showModeInicial('date') }}
                        />
                        <DateTimeInput
                            texto={horaInicialBr}
                            tamanho="60px"
                            onPress={() => { showModeInicial('time') }}
                        />
                    </ViewHorizontal>
                </View>
                <View>
                    <Text>Final</Text>
                    <ViewHorizontal>
                        <DateTimeInput
                            texto={dataFinalBr}
                            tamanho="110px"
                            onPress={() => { showModeFinal('date') }}
                        />
                        <DateTimeInput
                            texto={horaFinalBr}
                            tamanho="60px"
                            onPress={() => { showModeFinal('time') }}
                        />
                    </ViewHorizontal>
                </View>
            </ViewHorizontal>
            <ViewHorizontal>
                <ButtonTopMenu texto='Listar' tamanho='100px' onPress={() => listDataHora(dateStart, dateEnd)} />
                <ButtonTopMenu texto='Exportar' tamanho='100px' onPress={null} />
                <ButtonTopMenu texto='Excluir' tamanho='100px' onPress={() => removerDataHora(dateStart, dateEnd)} />
            </ViewHorizontal>
            <ViewHorizontal>
                <Text>{ `Quantidade: ${listagem?.length}` }</Text>
            </ViewHorizontal>
            <View>
                {
                    listagem.map((element:any) => {
                        return(
                            <Text key={element.id}>{element.contador} {element.dataHora}</Text>
                        )
                    })
                }
            </View>
            {showInicial && (
                <DateTimePicker
                    testID='dateTimePicker'
                    value={dateStart}
                    mode={modeInicial}
                    is24Hour={true}
                    display='default'
                    onChange={onChangeInicial}
                />
            )}
            {showFinal && (
                <DateTimePicker
                    testID='dateTimePicker'
                    value={dateEnd}
                    mode={modeFinal}
                    is24Hour={true}
                    display='default'
                    onChange={onChangeFinal}
                />
            )}
        </View>
    );
};

export default Pagination;
