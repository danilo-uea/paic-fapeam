import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type propsNavigationStack = {
    Main?: {
        name: string
        id: number
    }
    Pagination?: {
        name: string
        id: number
    }
}

export type propsStack = NativeStackNavigationProp<propsNavigationStack>