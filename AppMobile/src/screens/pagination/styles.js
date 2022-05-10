import React from 'react';
import styled from 'styled-components/native';

const InputArea = styled.View`
    width: 100%;
    height: 60px;
    background-color: #83D6E3;
    flex-direction: row;
    border-radius: 30px;
    padding-left: 15px;
    align-items: center;
    margin-bottom: 15px;
`;
const Input = styled.TextInput`
    flex: 1;
    font-size: 16px;
    color: #268596;
    margin-left: 10px;
`;

export const ViewHorizontal = styled.View`
    flex-direction: row;
    margin-top: 5px;
`;

export const CustomButton = styled.TouchableOpacity`
    height: 35px;
    width: 100px;
    background-color: #354C9C;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    margin: 1px;
`;

export const CustomButtonText = styled.Text`
    font-size: 15px;
    color: #FFF;
`;