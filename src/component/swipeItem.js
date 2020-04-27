// @flow
import React, { type Element, type ComponentType } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    View,
    Platform
} from 'react-native';
import type {
    PanResponderInstance, 
    GestureResponderEvent, 
    PanResponderGestureState
} from 'PanResponder';
import SwipeButtonsContainer from './swipeButtonsContainer';

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
    disableSwipeIfNoButton: Boolean;
}

type States = {|
    panDistance: Animated.ValueXY,
    rightButtonTriggerPosition: number,
    leftButtonTriggerPosition: number,
|}

declare var JSX: any;

export default class SwipeItem extends React.Component<Props, States> {

    _swipeItem: SwipeItem = this;
    _panResponder: PanResponder;
    _panDistanceOffset: {x: number, y: number} = {x: 0, y: 0};
    _isRightButtonShowing = false;
    _isLeftButtonShowing = false;

    state: States = {
        panDistance: new Animated.ValueXY(),
        rightButtonTriggerPosition: 0,
        leftButtonTriggerPosition: 0,
    }

    constructor(props: Props) {
        super(props);
        this._panResponder = this._createPanResponderInstance();
        this.state.panDistance.addListener((value) => {
            this._panDistanceOffset = value;
        });
    }

    componentWillUnmount() {
        this.state.panDistance.removeAllListeners();
    }

    /**
     * create panResponder
     */
    _createPanResponderInstance() : PanResponderInstance {
        let instance: PanResponderInstance = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                if (Math.abs(gestureState.dx) < 5) {
                    return false;
                }
                if (this.props.disableSwipeIfNoButton) {
                    if ((!this.props.leftButtons && gestureState.dx > 0 && !this._isRightButtonShowing)
                        || (!this.props.rightButtons && gestureState.dx < 0 && !this._isLeftButtonShowing)) {
                        return false;
                    }
                }
                const {
                    x: offsetX
                } = this._panDistanceOffset;
                
                if (Math.round(offsetX) === 0) {
                    this.props.onSwipeInitial && this.props.onSwipeInitial(this._swipeItem);
                }
                return true;
            },
            onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                //setting pan distance offset, make sure next touch will not jump to touch position immediately
                this.state.panDistance.setOffset(this._panDistanceOffset);
                //initial panDistance
                this.state.panDistance.setValue({x: 0, y: 0});
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    {
                        dx: this.state.panDistance.x,
                    },
                ],
            ),
            onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
            },
            onPanResponderTerminate: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
                return true;  
            },
            onPanResponderTerminationRequest: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
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
            this.props.onMovedToOrigin && this.props.onMovedToOrigin(this._swipeItem);
        }
        //Merges the offset value into the base value and resets the offset to zero.
        this.state.panDistance.flattenOffset();
        Animated.spring(this.state.panDistance, {
            toValue: {
                x: toX, 
                y: 0
            },
            friction: 10,
        }).start();
    }

    close() {
        this._moveToDestination(0);
    }

    /**
     * get the Swipe component's position after user release gesture
     * @param {number} panDistanceX the distance of x-axis for gesture
     */
    _getSwipePositionDestinationValueX(panDistanceX: number): number {
        const {
            leftButtonTriggerPosition,
            rightButtonTriggerPosition,
        } = this.state;

        let toValueX: number = 0;
        let panSide: string = (panDistanceX > 0)? 'right': 'left';
        let containerOffset: number = this._panDistanceOffset.x;        

        if (panSide === 'right' && containerOffset > leftButtonTriggerPosition) {
            toValueX = leftButtonTriggerPosition;
            this._isLeftButtonShowing = true;
            this.props.onLeftButtonsShowed && this.props.onLeftButtonsShowed(this._swipeItem);
        }

        if (panSide === 'left' && containerOffset < rightButtonTriggerPosition) {
            toValueX = rightButtonTriggerPosition;
            this._isRightButtonShowing = true;
            this.props.onRightButtonsShowed && this.props.onRightButtonsShowed(this._swipeItem);
        }

        return toValueX;
    }

    _renderleftButtonsIfNotNull(): JSX.Element {
        const {
            leftButtons = null
        } = this.props;

        const {
            leftButtonTriggerPosition
        } = this.state;

        if (leftButtons == null) {
            return null;
        }
        const {
            style,
            children
        } = leftButtons.props;
        
        let scale = this.state.panDistance.x.interpolate({
            inputRange: [ -Infinity, -0.01, 0, leftButtonTriggerPosition, Infinity],
            outputRange: [ 0.01, 0.01, 0.7, 1, 1],
        });

        let widthStyle = {
            transform: [{scale}]
        };
        
        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.left, widthStyle]}
                onLayout={({nativeEvent}) => {
                    this.setState({
                        leftButtonTriggerPosition: nativeEvent.layout.width
                    });
                }}
            >
                {children}
            </SwipeButtonsContainer>
        );
    }

    _renderrightButtonsIfNotNull(): JSX.Element {
        const {
            rightButtons = null
        } = this.props;

        const {
            rightButtonTriggerPosition
        } = this.state;

        if (rightButtons == null) {
            return null;
        }

        const {
            style,
            children,
        } = rightButtons.props;
        
        let scale = this.state.panDistance.x.interpolate({
            inputRange: [-Infinity , rightButtonTriggerPosition, 0, 0.1, Infinity],
            outputRange: [1, 1, 0.7, 0.01, 0.01],
        });

        let widthStyle = {
            transform: [{scale}]
        };
        
        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.right, widthStyle]}
                onLayout={({nativeEvent}) => {
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
            transform: this.state.panDistance.getTranslateTransform()
        };
        
        const {
            style,
            swipeContainerStyle,
            containerView: ContainerView = View,
        } = this.props;
        
        return (
            <View>
                <ContainerView
                    style={[
                        style, 
                        containerStyles.rootContainer,
                    ]}
                >
                    <View
                        style={[containerStyles.buttonsContainer]}
                    >
                        {this._renderleftButtonsIfNotNull()}
                        {this._renderrightButtonsIfNotNull()}
                    </View>
                    <Animated.View
                        style={[containerStyles.swipeContainer, panStyle]}
                        {...this._panResponder.panHandlers}
                    >   
                        <View
                            style={[swipeContainerStyle, containerStyles.swipeContainer]}
                        >
                            {this.props.children}
                        </View>
                    </Animated.View>
                    
                </ContainerView>
            </View>
        );
    }

}

const containerStyles = StyleSheet.create({
    rootContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonsContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
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
        right: 0
    },
});
