import React, { ReactElement } from "react";
import { View, TouchableOpacity } from "react-native";
import { BoardState, BoardResult } from "@utils";
// avoiding require cycle error
import Text from "../text/text";
import BoardLine from "./board-line";

type BoardProps = {
    state: BoardState;
    size: number;
    onCellPressed?: (index: number) => void;
    disabled?: boolean;
    gameResult?: BoardResult | false;
};

export default function Board({
    state,
    size,
    onCellPressed,
    disabled,
    gameResult
}: BoardProps): ReactElement {
    return (
        <View
            style={{
                width: size,
                height: size,
                backgroundColor: "green",
                flexDirection: "row",
                flexWrap: "wrap"
            }}
        >
            {state.map((cell, index) => {
                return (
                    <TouchableOpacity
                        disabled={disabled}
                        onPress={() => onCellPressed && onCellPressed(index)}
                        style={{
                            width: "33.3333%",
                            height: "33.3333%",
                            backgroundColor: "#fff",
                            borderWidth: 1,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        key={index}
                    >
                        <Text style={{ fontSize: size / 8 }}>{cell}</Text>
                    </TouchableOpacity>
                );
            })}
            {true && (
                <BoardLine
                    size={size}
                    gameResult={{ winner: "o", diagonal: "MAIN", direction: "D" }}
                />
            )}
        </View>
    );
}
