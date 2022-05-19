// @flow
import React, { type Element, type ComponentType } from 'react';
import { Animated, PanResponder, StyleSheet, View, Platform, I18nManager } from 'react-native';
import type { PanResponderInstance } from 'react-native/Libraries/Interaction/PanResponder';
import SwipeButtonsContainer from './swipeButtonsContainer';
import { SwipeContext } from './swipeContext';

type Props = {
    children?: any,
    style?: any,
    swipeContainerStyle?: any,
    leftButtons?: Element<typeof SwipeButtonsContainer>,
    rightButtons?: Element<typeof SwipeButtonsContainer>,
    containerView?: ComponentType<*>,
    onSwipeInitial?: (swipeItem: SwipeItem) => mixed,
    onLeftButtonsShowed?: (swipeItem: SwipeItem) => mixed,
    onRightButtonsShowed?: (swipeItem: SwipeItem) => mixed,
    onMovedToOrigin?: (swipeItem: SwipeItem) => mixed,
    disableSwipeIfNoButton: boolean,
    swipeThreshold?: {
        left?: number,
        right?: number,
    },
    disableButtonScale?: {
        left?: boolean,
        right?: boolean,
    },
};

type States = {|
    panDistance: Animated.ValueXY,
    rightButtonTriggerPosition: number,
    leftButtonTriggerPosition: number,
|};

declare var JSX: any;

export default class SwipeItem extends React.Component<Props, States> {
    static contextType = SwipeContext;

    _swipeItem: SwipeItem = this;
    _panResponder: PanResponderInstance;
    _panDistanceOffset: { x: number, y: number } = { x: 0, y: 0 };
    _isRightButtonShowing = false;
    _isLeftButtonShowing = false;
    _isGestureDisabled = false;

    state: States = {
        panDistance: new Animated.ValueXY(),
        rightButtonTriggerPosition: 0,
        leftButtonTriggerPosition: 0,
    };

    constructor(props: Props) {
        super(props);
        this._panResponder = this._createPanResponderInstance();
        this.state.panDistance.addListener((value) => {
            this._panDistanceOffset = value;
        });
    }

    componentWillUnmount() {
        this.context && this.context.removeOpenedItemRef(this);
        this.state.panDistance.removeAllListeners();
    }

    /**
     * create panResponder
     */
    _createPanResponderInstance(): PanResponderInstance {
        let instance: PanResponderInstance = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                if (Math.abs(gestureState.dx) < 5) {
                    return false;
                }
                if (this.props.disableSwipeIfNoButton) {
                    if (
                        (!this.props.leftButtons && gestureState.dx > 0 && !this._isRightButtonShowing) ||
                        (!this.props.rightButtons && gestureState.dx < 0 && !this._isLeftButtonShowing)
                    ) {
                        return false;
                    }
                }
                this._isGestureDisabled = false;
                const { x: offsetX } = this._panDistanceOffset;

                if (Math.round(offsetX) === 0) {
                    this.props.onSwipeInitial && this.props.onSwipeInitial(this._swipeItem);

                    this.context && this.context.setOpenedItemRef(this, 'onItemMoved');
                }
                return true;
            },
            onPanResponderGrant: (evt, gestureState) => {
                //setting pan distance offset, make sure next touch will not jump to touch position immediately
                this.state.panDistance.setOffset(this._panDistanceOffset);
                //initial panDistance
                this.state.panDistance.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState) => {
                if (this._isGestureDisabled) {
                    return;
                }
                const {
                    swipeThreshold = {
                        right: Infinity,
                        left: Infinity,
                    },
                } = this.props;

                const dx = gestureState.dx;

                if (
                    dx > 0 &&
                    dx > swipeThreshold.left &&
                    dx < this.state.leftButtonTriggerPosition &&
                    !this._isLeftButtonShowing
                ) {
                    this._isGestureDisabled = true;

                    Animated.spring(this.state.panDistance, {
                        useNativeDriver: false,
                        toValue: {
                            x: this.state.leftButtonTriggerPosition,
                            y: 0,
                        },
                    }).start();

                    this._openLeftButton();
                    return;
                }
                if (
                    dx < 0 &&
                    Math.abs(dx) > swipeThreshold.right &&
                    Math.abs(dx) < Math.abs(this.state.rightButtonTriggerPosition) &&
                    !this._isRightButtonShowing
                ) {
                    this._isGestureDisabled = true;

                    Animated.spring(this.state.panDistance, {
                        useNativeDriver: false,
                        toValue: {
                            x: this.state.rightButtonTriggerPosition,
                            y: 0,
                        },
                    }).start();

                    this._openRightButton();
                    return;
                }

                Animated.event(
                    [
                        null,
                        {
                            dx: this.state.panDistance.x,
                        },
                    ],
                    {
                        useNativeDriver: false,
                    }
                )(evt, gestureState);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (!this._isGestureDisabled) {
                    this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
                }
            },
            onPanResponderTerminate: (evt, gestureState) => {
                if (!this._isGestureDisabled) {
                    this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
                }
                return true;
            },
            onPanResponderTerminationRequest: (evt, gestureState) => {
                // On Android, the component will stick at the last swipe position when pan responder terminate
                // return true, at onPanResponderTerminate function will move the swipe component to origin position
                if (Platform.OS === 'android') {
                    return true;
                }
                return false;
            },
        });
        return instance;
    }

    /**
     * move the swipe component to destination
     * @param {number} toX the x-axis of move destination
     */
    _moveToDestination(toX: number) {
        if (Math.round(toX) === 0) {
            this._isLeftButtonShowing = false;
            this._isRightButtonShowing = false;
            this.context && this.context.removeOpenedItemRef(this);
            this.props.onMovedToOrigin && this.props.onMovedToOrigin(this._swipeItem);
        }
        //Merges the offset value into the base value and resets the offset to zero.
        this.state.panDistance.flattenOffset();
        Animated.spring(this.state.panDistance, {
            useNativeDriver: false,
            toValue: {
                x: toX,
                y: 0,
            },
            friction: 10,
        }).start();
    }

    close() {
        this._moveToDestination(0);
    }

    _openRightButton(): void {
        this._isRightButtonShowing = true;
        this.props.onRightButtonsShowed && this.props.onRightButtonsShowed(this._swipeItem);

        this.context && this.context.setOpenedItemRef(this, 'onButtonShowed');
    }

    _openLeftButton(): void {
        this._isLeftButtonShowing = true;
        this.props.onLeftButtonsShowed && this.props.onLeftButtonsShowed(this._swipeItem);

        this.context && this.context.setOpenedItemRef(this, 'onButtonShowed');
    }

    /**
     * get the Swipe component's position after user release gesture
     * @param {number} panDistanceX the distance of x-axis for gesture
     */
    _getSwipePositionDestinationValueX(panDistanceX: number): number {
        const { leftButtonTriggerPosition, rightButtonTriggerPosition } = this.state;

        let toValueX: number = 0;
        let panSide: string = panDistanceX > 0 ? 'right' : 'left';
        let containerOffset: number = this._panDistanceOffset.x;

        if (panSide === 'right' && containerOffset > leftButtonTriggerPosition && !!this.props.leftButtons) {
            toValueX = leftButtonTriggerPosition;
            this._openLeftButton();
        }

        if (panSide === 'left' && containerOffset < rightButtonTriggerPosition && !!this.props.rightButtons) {
            toValueX = rightButtonTriggerPosition;
            this._openRightButton();
        }
        return toValueX;
    }

    _renderleftButtonsIfNotNull(): JSX.Element {
        const { leftButtons = null, disableButtonScale = { left: false } } = this.props;

        const { leftButtonTriggerPosition } = this.state;

        if (leftButtons == null) {
            return null;
        }
        const { style, children } = leftButtons.props;

        let scale = disableButtonScale.left
            ? 1
            : this.state.panDistance.x.interpolate({
                  inputRange: [-Infinity, -0.01, 0, leftButtonTriggerPosition, Infinity],
                  outputRange: [0.01, 0.01, 0.7, 1, 1],
              });

        let widthStyle = {
            transform: [{ scale }],
        };

        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.left, widthStyle]}
                onLayout={({ nativeEvent }) => {
                    this.setState({
                        leftButtonTriggerPosition: nativeEvent.layout.width,
                    });
                }}
            >
                {children}
            </SwipeButtonsContainer>
        );
    }

    _renderrightButtonsIfNotNull(): JSX.Element {
        const { rightButtons = null, disableButtonScale = { right: false } } = this.props;

        const { rightButtonTriggerPosition } = this.state;

        if (rightButtons == null) {
            return null;
        }

        const { style, children } = rightButtons.props;

        let scale = disableButtonScale.right
            ? 1
            : this.state.panDistance.x.interpolate({
                  inputRange: [-Infinity, rightButtonTriggerPosition, 0, 0.1, Infinity],
                  outputRange: [1, 1, 0.7, 0.01, 0.01],
              });

        let widthStyle = {
            transform: [{ scale }],
        };

        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.right, widthStyle]}
                onLayout={({ nativeEvent }) => {
                    this.setState({
                        rightButtonTriggerPosition: -1 * nativeEvent.layout.width,
                    });
                }}
            >
                {children}
            </SwipeButtonsContainer>
        );
    }

    render() {
        const panStyle = {
            transform: this.state.panDistance.getTranslateTransform(),
        };

        const { style, swipeContainerStyle, containerView: ContainerView = View } = this.props;

        return (
            <View>
                <ContainerView style={[style, containerStyles.rootContainer]}>
                    <View style={[containerStyles.buttonsContainer]}>
                        {this._renderleftButtonsIfNotNull()}
                        {this._renderrightButtonsIfNotNull()}
                    </View>
                    <Animated.View
                        style={[containerStyles.swipeContainer, panStyle]}
                        {...this._panResponder.panHandlers}
                    >
                        <View style={[swipeContainerStyle, containerStyles.swipeContainer]}>{this.props.children}</View>
                    </Animated.View>
                </ContainerView>
            </View>
        );
    }
}

const containerStyles = StyleSheet.create({
    rootContainer: {
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        justifyContent: 'center',
    },
    buttonsContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        top: 0,
        left: 0,
    },
    swipeContainer: {
        height: '100%',
        width: '100%',
    },
});

const buttonViewStyles = StyleSheet.create({
    container: {
        position: 'absolute',
    },
    left: {
        left: 0,
    },
    right: {
        right: 0,
    },
});
