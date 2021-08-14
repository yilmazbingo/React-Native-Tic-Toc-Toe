import React, { ReactElement } from "react";
import { View, TouchableOpacity } from "react-native";
import { BoardState, BoardResult } from "@utils";
// avoiding require cycle error
import Text from "../text/text";
import BoardLine from "./board-line";
import styles from "./board.styles";

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
            style={[
                styles.board,
                {
                    width: size,
                    height: size
                }
            ]}
        >
            {state.map((cell, index) => {
                return (
                    <TouchableOpacity
                        disabled={disabled}
                        onPress={() => onCellPressed && onCellPressed(index)}
                        // since it is dynamic, ts cannot figure out if that key exists
                        style={[styles.cell, styles[`cell${index}` as "cell"]]}
                        key={index}
                    >
                        <Text style={[styles.cellText, { fontSize: size / 7 }]}>{cell}</Text>
                    </TouchableOpacity>
                );
            })}
            {gameResult && <BoardLine size={size} gameResult={gameResult} />}
        </View>
    );
}
