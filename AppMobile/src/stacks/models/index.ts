import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type propsNavigationStack = {
    Main?: { }
    Pagination?: { }
    Details?: {
        id: number
    }
}

export type propsStack = NativeStackNavigationProp<propsNavigationStack>