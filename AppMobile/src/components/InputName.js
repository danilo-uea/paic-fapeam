import React from 'react';
import styled from 'styled-components/native';

const InputArea = styled.View`
    width: 100%;
    height: 60px;
    background-color: #E5E5E5;
    flex-direction: row;
    border-radius: 30px;
    padding-left: 15px;
    align-items: center;
    margin-bottom: 15px;
`;

const Input = styled.TextInput`
    flex: 1;
    font-size: 16px;
    color: #354C9C;
    margin-left: 10px;
`;

const InputName = ({ placeholder, value, onChangeText}) => {
    return (
        <InputArea>
            <Input
                placeholder={placeholder}
                placeholderTextColor="#7b8fd1"
                value={value}
                onChangeText={onChangeText}
            />
        </InputArea>
    );
}

export default InputName