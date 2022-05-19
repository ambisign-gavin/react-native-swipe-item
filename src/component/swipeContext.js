// @flow
import React from 'react';

export type SwipeItemRef = {
    close: () => void,
};
export type ItemCloseTrigger = 'onItemMoved' | 'onButtonShowed';
export type SwipeMode = 'single' | 'multiple';

export type SwipeContextType = {
    mode: SwipeMode,
    closeTrigger: ItemCloseTrigger,
    setOpenedItemRef: (ref: SwipeItemRef, trigger: ItemCloseTrigger) => void,
    removeOpenedItemRef: (ref: SwipeItemRef) => void,
};

export const SwipeContext = React.createContext<SwipeContextType>({
    mode: 'single',
    closeTrigger: 'onItemMoved',
    setOpenedItemRef: () => {},
    removeOpenedItemRef: () => {},
});
