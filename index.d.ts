declare module 'react-native-swipe-item' {
    import { ViewStyle, ViewProps } from 'react-native';
    import { Component, ReactChild, ReactNode } from 'react';

    export class SwipeButtonsContainer extends Component<ViewProps, any> {}

    interface SwipeItemProps {
        children?: ReactNode;
        /**
         * Swipe item layout style
         */
        style?: ViewStyle;
        /**
         * Swipe item style
         */
        swipeContainerStyle?: ViewStyle;
        /**
         * Buttons that want to show on the left when the item swiped to right.
         */
        leftButtons?: ReactNode;
        /**
         * Buttons that want to show on the right when the item swiped to right.
         */
        rightButtons?: ReactNode;
        /**
         * The component for the swipe item.
         * More Information: https://github.com/ambisign-gavin/react-native-swipe-item#containerView
         */
        containerView?: ReactNode;
        /**
         * will be triggered when the item started swipe from the origin position
         * @param {SwipeItem} swipeItem SwipeItem reference
         */
        onSwipeInitial?: (swipeItem: SwipeItem) => void;
        /**
         * will be triggered when left buttons showed
         * @param {SwipeItem} swipeItem SwipeItem reference
         */
        onLeftButtonsShowed?: (swipeItem: SwipeItem) => void;
        /**
         * will be triggered when right buttons showed
         * @param {SwipeItem} swipeItem SwipeItem reference
         */
        onRightButtonsShowed?: (swipeItem: SwipeItem) => void;
        /**
         * will be triggered when the item moved to the origin position
         */
        onMovedToOrigin?: (swipeItem: SwipeItem) => void;
        /**
         * disable the swipe feature when there are no buttons.
         */
        disableSwipeIfNoButton?: boolean;
        /**
         * The swipe item will be opened automatically when the position pass the threshold, and you can set the left and right buttons separately.
         */
        swipeThreshold?: {
            left?: number;
            right?: number;
        };
        /**
         * you can disabled left or right or both button scale when swiping.
         */
        disableButtonScale?: {
            left?: boolean;
            right?: boolean;
        };
    }
    export class SwipeItem extends Component<SwipeItemProps, {}> {
        /**
         * Close Swipe Item
         */
        close(): void;
    }

    interface SwipeProviderProps {
        /**
         * Swipe items mode, default is single
         */
        mode?: 'single' | 'multiple';
        /**
         * The trigger for automatically closed swipe item , default is onItemMoved
         * `onItemMoved` - when the swipe item is moved, the opened one will be closed.
         * `onButtonShowed` - when the swipe item button is showing, the opened one will be closed.
         */
        closeTrigger?: 'onItemMoved' | 'onButtonShowed';
    }

    export class SwipeProvider extends Component<SwipeProviderProps, {}> {}
}
