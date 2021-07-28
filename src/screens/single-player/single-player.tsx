import React, { ReactElement, useState } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";
import {
    BoardState,
    printFormattedBoard,
    isEmpty,
    isFull,
    isTerminal,
    getAvailableMoves
} from "@utils";
import styles from "./single-player.styles";

export default function Game(): ReactElement {
    //prettier-ignore
    const [state, setState] = useState<BoardState>([
        null,null,null,
        null,null,null,
        null,null,null
    ])
    const handleOnCellPressed = (cell: number): void => {
        const stateCopy: BoardState = [...state];
        // if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = "x";
        setState(stateCopy);
    };
    printFormattedBoard(state);
    console.log(isTerminal(state));
    // console.log(getAvailableMoves(b));
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state))}
                    onCellPressed={cell => handleOnCellPressed(cell)}
                    state={state}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
