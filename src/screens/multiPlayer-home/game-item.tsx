import React, { ReactElement, useEffect, useState, useRef } from "react";
import { TouchableOpacity, Animated } from "react-native";
import { API, graphqlOperation } from "aws-amplify";
import Observable from "zen-observable";
import { Text } from "@components";
import { colors } from "@utils";
import { useAuth } from "@contexts/auth-context";
import { PlayerGameType, onUpdateGameById } from "./multiplayer-home.graphql";
import styles from "./multiPlayer-home.styles";

export default function GameItem({
    playerGame: playerGameProp
}: {
    playerGame: PlayerGameType;
}): ReactElement | null {
    const [playerGame, setPlayerGame] = useState(playerGameProp);
    // this value can be animated one value to another
    const animationRef = useRef<Animated.Value>(new Animated.Value(0));
    const { user } = useAuth();
    if (!user || !playerGame) return null;
    // false will be returned if the game is active
    const getResult = (playerGame: PlayerGameType): "win" | "loss" | "draw" | false => {
        if (!playerGame || !user) return false;

        const game = playerGame.game;
        if (game.status !== "FINISHED") return false;
        const opponent = game?.players?.items?.find(
            playerGame => playerGame?.player?.username !== user.username
        );
        if (game.winner === user.username) return "win";
        if (game.winner === opponent?.player?.username) return "loss";
        // null means game is draw
        if (game.winner === null) return "draw";
        // default condition for avoidign ts error
        return false;
    };
    const game = playerGame?.game;
    const result = getResult(playerGame);

    const opponent = game?.players?.items?.find(
        playerGame => playerGame?.player?.username !== user.username
    );

    useEffect(() => {
        // we have to subscribe only if the game is not finished
        if (game && (game.status === "REQUESTED" || game.status === "ACTIVE")) {
            // this returns an observable and we have to subscribe to this observable
            const gameUpdates = API.graphql(
                graphqlOperation(onUpdateGameById, {
                    id: game.id
                })
            ) as unknown as Observable<{ [key: string]: any }>;
            const subscription = gameUpdates.subscribe({
                // value is the updated game
                next: ({ value }) => {
                    // console.log("value from subscription",value);
                    const newGame = value.data.onUpdateGameById;
                    if (newGame) {
                        setPlayerGame({
                            ...playerGame,
                            ["game"]: { ...playerGame?.game, ...newGame }
                        });
                        if (newGame.status === "FINISHED") {
                            subscription.unsubscribe();
                        }
                        // pass array of animations
                        Animated.sequence([
                            Animated.timing(animationRef.current, {
                                toValue: 1,
                                duration: 500,
                                useNativeDriver: false
                            }),
                            Animated.delay(1000),
                            Animated.timing(animationRef.current, {
                                toValue: 0,
                                duration: 500,
                                useNativeDriver: false
                            })
                        ]).start();
                    }
                }
            });
            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);
    return (
        // Touchable opacity cannot be animated
        <TouchableOpacity style={styles.item}>
            <Animated.View
                style={[
                    styles.itemBackground,
                    {
                        backgroundColor: animationRef.current.interpolate({
                            inputRange: [0, 1],
                            outputRange: [colors.purple, colors.lightPurple]
                        })
                    }
                ]}
            />

            <Text style={styles.itemTitle}>
                {opponent?.player?.name} ({opponent?.player?.username})
            </Text>
            {(game?.status === "REQUESTED" || game?.status === "ACTIVE") && (
                <Text style={{ color: colors.lightGreen, textAlign: "center" }}>
                    {game.turn === user.username
                        ? "Your Turn"
                        : `Waiting for ${opponent?.player?.username}`}
                </Text>
            )}
            {result && (
                <Text style={{ color: colors[result], textAlign: "center" }}>
                    {result === "win" && "You Won!"}
                </Text>
            )}
            {result && (
                <Text style={{ color: colors[result], textAlign: "center" }}>
                    {result === "loss" && "You Lost!"}
                </Text>
            )}
            {result && (
                <Text style={{ color: colors[result], textAlign: "center" }}>
                    {result === "draw" && "It's a draw"}
                </Text>
            )}
        </TouchableOpacity>
    );
}
