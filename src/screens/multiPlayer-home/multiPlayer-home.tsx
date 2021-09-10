import React, { ReactElement, useEffect, useState } from "react";
import { Alert, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api";
import Modal from "react-native-modal";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from "@contexts/auth-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackNavigatorParams } from "@config/navigator";
import styles from "./multiPlayer-home.styles";
import { colors } from "@utils";
import GameItem from "./game-item";
import { GetPlayerQuery } from "../../API";
import PlayersModal from "./players-modal/PlayersModal";
import { getPlayer, PlayerGamesType } from "./multiplayer-home.graphql";
import { GradientBackground, Text, Button } from "@components";

type MultiPlayerHomeScreenNavigationProp = StackNavigationProp<
    StackNavigatorParams,
    "MultiPlayerHome"
>;
type MultiPlayerHomeProps = {
    navigation: MultiPlayerHomeScreenNavigationProp;
};

export default function multiPlayerHome({ navigation }: MultiPlayerHomeProps): ReactElement {
    const { user } = useAuth();
    // player games is the intermediate model that links games and players
    const [playerGames, setPlayerGames] = useState<PlayerGamesType>([]);
    const [nextToken, setNextToken] = useState<string | null | undefined>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [playersModal, setPlayersModal] = useState(false);

    // init is set to indicate if we are first time rendering the page.
    const fetchPlayer = async (nextToken: string | null | undefined, init = false) => {
        setLoading(true);
        if (user) {
            setLoading(true);
            // that means we are refreshing.
            if (nextToken === null && !init) {
                setRefreshing(true);
            }
            try {
                const player = (await API.graphql(
                    graphqlOperation(getPlayer, {
                        username: user.username,
                        limit: 1,
                        sortDirection: "DESC",
                        nextToken
                    })
                    // we can get the type of generic by "amplify codegen" which will generate the type into API.ts
                )) as GraphQLResult<GetPlayerQuery>;
                if (player.data?.getPlayer?.games) {
                    // when we load more, new items will replace the old items. we want to diplay below
                    const newPlayerGames = player?.data?.getPlayer?.games?.items || [];
                    // if we are refreshing or this is first time loading, show the first items
                    setPlayerGames(
                        !newPlayerGames || nextToken === null
                            ? newPlayerGames
                            : [...playerGames, ...newPlayerGames]
                    );
                    setNextToken(player.data.getPlayer.games.nextToken);
                }
            } catch (e) {
                console.log(e);
                Alert.alert("Error!", "An error has occured");
            }
            setLoading(false);
            setRefreshing(false);
        }
    };

    // const renderGame = ({ item }: { item: PlayerGameType }) => {
    //     if (!user) return null;
    //     const game = item?.game;
    //     const result = getResult(item);

    //     const opponent = game?.players?.items?.find(
    //         playerGame => playerGame?.player?.username !== user.username
    //     );
    //     return (
    //         <TouchableOpacity style={styles.item}>
    //             <Text style={styles.itemTitle}>
    //                 {opponent?.player?.name} ({opponent?.player?.username})
    //             </Text>
    //             {(game?.status === "REQUESTED" || game?.status === "ACTIVE") && (
    //                 <Text style={{ color: colors.lightGreen, textAlign: "center" }}>
    //                     {game.turn === user.username
    //                         ? "Your Turn"
    //                         : `Waiting for ${opponent?.player?.username}`}
    //                 </Text>
    //             )}
    //             {result && (
    //                 <Text style={{ color: colors[result], textAlign: "center" }}>
    //                     {result === "win" && "You Won!"}
    //                 </Text>
    //             )}
    //             {result && (
    //                 <Text style={{ color: colors[result], textAlign: "center" }}>
    //                     {result === "loss" && "You Lost!"}
    //                 </Text>
    //             )}
    //             {result && (
    //                 <Text style={{ color: colors[result], textAlign: "center" }}>
    //                     {result === "draw" && "It's a draw"}
    //                 </Text>
    //             )}
    //         </TouchableOpacity>
    //     );
    // };

    useEffect(() => {
        // when first we fetch, we want the first page
        fetchPlayer(null, true);
    }, []);
    return (
        // when we show large amount data we do not use scrollView. Flatlist will optimize so that it prevents rendering a large data at once
        // FlatList extends scroll view, ALl props that passed in ScrollView can be passed to Flatlist
        <GradientBackground>
            {user ? (
                <>
                    <FlatList
                        contentContainerStyle={styles.container}
                        data={playerGames}
                        renderItem={({ item }) => (
                            <GameItem
                                onPress={() => {
                                    if (item?.game) {
                                        navigation.navigate("MultiPlayerGame", {
                                            gameID: item?.game.id
                                        });
                                    }
                                }}
                                playerGame={item}
                            />
                        )}
                        keyExtractor={playerGame =>
                            playerGame ? playerGame.game.id : `${new Date().getTime()}`
                        }
                        ListFooterComponent={() => {
                            if (!nextToken) return null;
                            return (
                                <Button
                                    style={{ marginTop: 20 }}
                                    loading={loading && !refreshing}
                                    title="Load More"
                                    onPress={() => {
                                        fetchPlayer(nextToken);
                                    }}
                                />
                            );
                        }}
                        refreshControl={
                            <RefreshControl
                                tintColor={colors.lightGreen}
                                refreshing={refreshing}
                                onRefresh={() => {
                                    fetchPlayer(null);
                                }}
                            />
                        }
                        // ternary does not work with ListEmptyComponent
                        ListEmptyComponent={() => {
                            if (loading) {
                                return (
                                    <View style={styles.loading}>
                                        <ActivityIndicator color={colors.lightGreen} />
                                    </View>
                                );
                            }
                            return (
                                <View>
                                    <Text style={{ color: colors.lightGreen }}>No Games yet</Text>
                                </View>
                            );
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => setPlayersModal(true)}
                        // check paddingBottom both in android and ios
                        style={styles.newGameButton}
                    >
                        <Text style={styles.newGameButtonText}>New Game</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.container}>
                    <Text style={{ color: colors.lightGreen }}> You must be logged in</Text>
                </View>
            )}
            <Modal
                style={{ margin: 0 }}
                isVisible={playersModal}
                backdropOpacity={0.75}
                onBackButtonPress={() => setPlayersModal(false)}
                onBackdropPress={() => setPlayersModal(false)}
                avoidKeyboard
            >
                <PlayersModal
                    onItemPress={username => {
                        setPlayersModal(false);
                        navigation.navigate("MultiPlayerGame", { invitee: username });
                    }}
                />
            </Modal>
        </GradientBackground>
    );
}
