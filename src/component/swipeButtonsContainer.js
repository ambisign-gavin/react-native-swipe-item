// @flow
import React, { type Node } from 'react';
import { Animated } from 'react-native';

type Props = {
    children?: Node,
    style?: mixed,
}

export default class SwipeButtonsContainer extends React.Component<Props> {
    render() {
        const {
            style,
            children,
            ...other
        } = this.props;

        return (
            <Animated.View
                style={style}
                {...other}
            >
                {children}
            </Animated.View>
        );
    }
}