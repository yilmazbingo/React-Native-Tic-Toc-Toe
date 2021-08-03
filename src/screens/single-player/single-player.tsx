import React, { ReactElement, useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native";
import { GradientBackground, Board } from "@components";
import {
    BoardState,
    printFormattedBoard,
    isEmpty,
    isFull,
    isTerminal,
    getAvailableMoves,
    getBestMove,
    Cell,
    useSounds
} from "@utils";
import styles from "./single-player.styles";
import { loadAsync } from "expo-font";

export default function Game(): ReactElement {
    //prettier-ignore
    const [state, setState] = useState<BoardState>([
        null,null,null,
        null,null,null,
        null,null,null
    ])
    const [turn, setTurn] = useState<"HUMAN" | "BOT">(Math.random() < 0.5 ? "HUMAN" : "BOT");
    // player who starts the app maximizer
    const [isHumanMaximizing, setIsHumanMaximizing] = useState<boolean>(true);
    const playSound = useSounds();

    const gameResult = isTerminal(state);

    const insertCell = (cell: number, symbol: "x" | "o"): void => {
        const stateCopy: BoardState = [...state];
        // if (stateCopy[cell] || isTerminal(stateCopy)) return;
        stateCopy[cell] = symbol;
        setState(stateCopy);
        try {
            symbol === "x" ? playSound("pop1") : playSound("pop2");
        } catch (error) {
            console.log(error);
        }
    };
    const handleOnCellPressed = (cell: number): void => {
        // extra layer to disable the board
        if (turn !== "HUMAN") return;
        insertCell(cell, isHumanMaximizing ? "x" : "o");
        setTurn("BOT");
    };
    console.log("calling,", getBestMove(state, false));
    printFormattedBoard(state);
    console.log(isTerminal(state));
    // console.log(getAvailableMoves(b));

    const getWinner = (winnerSymbol: Cell): "HUMAN" | "BOT" | "DRAW" => {
        if (winnerSymbol === "x") {
            return isHumanMaximizing ? "HUMAN" : "BOT";
        }
        if (winnerSymbol === "o") {
            return isHumanMaximizing ? "BOT" : "HUMAN";
        }
        return "DRAW";
    };

    useEffect(() => {
        if (gameResult) {
            const winner = getWinner(gameResult.winner);
            if (winner === "HUMAN") {
                playSound("win");
                alert("You won");
            }
            if (winner === "BOT") {
                playSound("loss");

                alert("You lost");
            }
            if (winner === "DRAW") {
                playSound("draw");
                alert("It is a draw");
            }
        } else {
            if (turn === "BOT") {
                if (isEmpty(state)) {
                    // this is the best move for the start
                    const centerAndCorners = [0, 2, 6, 8, 4];
                    const firstMove =
                        centerAndCorners[Math.floor(Math.random() * centerAndCorners.length)];
                    insertCell(firstMove, "x");
                    setIsHumanMaximizing(false);
                    setTurn("HUMAN");
                } else {
                    const best = getBestMove(state, !isHumanMaximizing, 0, -1);
                    insertCell(best, isHumanMaximizing ? "o" : "x");
                    setTurn("HUMAN");
                }
            }
        }
    }, [state, turn]);
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <Board
                    disabled={Boolean(isTerminal(state)) || turn !== "HUMAN"}
                    onCellPressed={cell => handleOnCellPressed(cell)}
                    state={state}
                    gameResult={gameResult}
                    size={300}
                />
            </SafeAreaView>
        </GradientBackground>
    );
}
