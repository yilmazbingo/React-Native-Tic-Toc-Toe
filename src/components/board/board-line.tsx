import { BoardResult } from "@utils";
import React, { ReactElement, useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

const style = StyleSheet.create({
    line: {
        position: "absolute",
        backgroundColor: "red"
    },
    vLine: {
        width: 2
        //height: "100%" // heigght is getting animated, we dont add manually
    },
    hLine: {
        // height: "100%",
        width: 2
    },
    dLine: {
        width: 2,
        height: "100%",
        top: 0,
        left: "50%"
    }
});

type BoardLine = {
    size: number;
    gameResult: BoardResult | false;
};

export default function Boardline({ size, gameResult }: BoardLine): ReactElement {
    // this will create issue because we increased size but it will be rotated based on its center. thats why we add translate property
    const diagonalHeight = Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2));
    // if we dont use ref, animation will be reinitialized everytime we rerender the component
    //  we want animation to be rendered when component reredners so we use useeffect
    const animationRef = useRef<Animated.Value>(new Animated.Value(0));
    useEffect(() => {
        // timing is a linear animation
        Animated.timing(animationRef.current, {
            toValue: 1,
            duration: 700,
            // it might not work with the all properties that you need to animate. true might improve animation performance
            useNativeDriver: false
        }).start();
    }, []);

    return (
        <>
            {gameResult && gameResult.column && gameResult.direction === "V" && (
                // if we are using Animated, it has to be inside Animated.View not View
                <Animated.View
                    style={[
                        style.line,
                        style.vLine,

                        {
                            left: `${33.3333 * gameResult.column - 16.6666}%`,
                            // interpolate maps the animated value to another value
                            height: animationRef.current.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"]
                            })
                        }
                    ]}
                ></Animated.View>
            )}
            {gameResult && gameResult.row && gameResult.direction === "H" && (
                <Animated.View
                    style={[
                        style.line,
                        style.hLine,
                        {
                            top: `${33.3333 * gameResult.row - 16.6666}%`,
                            height: animationRef.current.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"]
                            })
                        }
                    ]}
                ></Animated.View>
            )}
            {gameResult && gameResult.diagonal && gameResult.direction === "D" && (
                <Animated.View
                    style={[
                        style.line,
                        style.dLine,
                        {
                            height: diagonalHeight,
                            transform: [
                                {
                                    // negative will shift it upward. since we are animating we have to change the size
                                    // translateY: -(diagonalHeight - size) / 2

                                    translateY: animationRef.current.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [size / 2, -(diagonalHeight - size) / 2]
                                    })
                                },
                                {
                                    rotateZ: gameResult.diagonal === "MAIN" ? "-45deg" : "45deg"
                                }
                            ]
                        }
                    ]}
                ></Animated.View>
            )}
        </>
    );
}
