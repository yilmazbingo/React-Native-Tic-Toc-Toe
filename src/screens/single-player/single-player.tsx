import React, { ReactElement, useState, useEffect } from "react";
import { SafeAreaView, Dimensions, View, Text, Platform } from "react-native"; //gets the dimensions of the current device
import { AdMobInterstitial, setTestDeviceIDAsync } from "expo-ads-admob";
import Constants from "expo-constants";
import { GradientBackground, Board, Button } from "@components";
import { useSettings, difficulties } from "@contexts/settings.context";
import {
    BoardState,
    printFormattedBoard,
    isEmpty,
    isTerminal,
    getBestMove,
    Cell,
    useSounds
} from "@utils";
import styles from "./single-player.styles";

const SCREEN_WIDTH = Dimensions.get("screen").width;
setTestDeviceIDAsync("EMULATOR");

// use test IDs on testing. google might ban u.
const addUnitID = Platform.select({
    ios:
        Constants.isDevice && !__DEV__
            ? "ca-app-pub-2427748286299308/6660257718"
            : "ca-app-pub-3940256099942544/1033173712",
    android: Constants.isDevice && !__DEV__ ? "REALID" : "ca-app-pub-3940256099942544/1033173712"
});

AdMobInterstitial.addEventListener("interstitialWillLeaveApplication", () => {
    console.log("left app");
});

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
    const [gameCount, setGameCount] = useState({
        wins: 0,
        losses: 0,
        draws: 0
    });
    const playSound = useSounds();
    const { settings } = useSettings();

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
    const newGame = () => {
        setState([null, null, null, null, null, null, null, null, null]);
        setTurn(Math.random() < 0.5 ? "HUMAN" : "BOT");
    };

    // call this when game ends
    const showAd = async () => {
        if (!addUnitID) return;
        try {
            await AdMobInterstitial.setAdUnitID(addUnitID);
            await AdMobInterstitial.requestAdAsync({
                servePersonalizedAds: true
            });
            await AdMobInterstitial.showAdAsync();
        } catch (error) {
            // repot this
            console.log("error during admob", error);
        }
    };
    useEffect(() => {
        if (gameResult) {
            const winner = getWinner(gameResult.winner);
            if (winner === "HUMAN") {
                playSound("win");
                setGameCount({ ...gameCount, wins: gameCount.wins + 1 });
            }
            if (winner === "BOT") {
                playSound("loss");
                setGameCount({ ...gameCount, wins: gameCount.losses + 1 });
            }
            if (winner === "DRAW") {
                playSound("draw");
                setGameCount({ ...gameCount, wins: gameCount.draws + 1 });
            }
            // show the game after 3 games:
            const { wins, draws, losses } = gameCount;
            const totalGames = wins + draws + losses;
            if (totalGames % 3 === 0) {
                showAd();
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
                    // -1 is means no difficulty set so we always lose
                    const best = getBestMove(
                        state,
                        !isHumanMaximizing,
                        0,
                        parseInt(settings ? settings?.difficulty : "-1")
                    );
                    insertCell(best, isHumanMaximizing ? "o" : "x");
                    setTurn("HUMAN");
                }
            }
        }
    }, [state, turn]);
    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <View>
                    <Text style={styles.difficulty}>
                        Diffciulty:{settings ? difficulties[settings.difficulty] : "impossible"}
                    </Text>
                    <View style={styles.results}>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}> Title </Text>
                            <Text style={styles.resultsTitle}> Draws </Text>
                            <Text style={styles.resultsCount}> {gameCount.draws} </Text>
                        </View>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}> Title </Text>
                            <Text style={styles.resultsTitle}> Wins </Text>
                            <Text style={styles.resultsCount}> {gameCount.wins} </Text>
                        </View>
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}> Title </Text>
                            <Text style={styles.resultsTitle}> Losses </Text>
                            <Text style={styles.resultsCount}> {gameCount.losses}</Text>
                        </View>
                    </View>
                </View>
                <Board
                    disabled={Boolean(isTerminal(state)) || turn !== "HUMAN"}
                    onCellPressed={cell => handleOnCellPressed(cell)}
                    state={state}
                    gameResult={gameResult}
                    size={SCREEN_WIDTH - 60}
                />
                {gameResult && (
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>
                            {getWinner(gameResult.winner) === "HUMAN" && "You Won"}{" "}
                            {getWinner(gameResult.winner) === "BOT" && "You Lost"}
                            {getWinner(gameResult.winner) === "DRAW" && "It is a draw"}
                        </Text>
                        <Button onPress={() => newGame()} title={"Play again"}></Button>
                    </View>
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}
