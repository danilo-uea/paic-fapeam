import React from 'react';
import styled from 'styled-components/native';

const InputArea = styled.TouchableOpacity`
    height: 35px;
    width: ${props => props.tamanho};
    background-color: #E5E5E5;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    margin: 1px;
`;

const Input = styled.Text`
    font-size: 15px;
    color: #354C9C;
`;

const DateTimeInput = ({ texto, tamanho, onPress }) => {
    return (
        <InputArea tamanho={tamanho} onPress={onPress}>
            <Input>
                {texto}
            </Input>
        </InputArea>
    );
}

export default DateTimeInput