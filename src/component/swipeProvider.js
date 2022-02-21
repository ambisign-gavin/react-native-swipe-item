// @flow
import React from 'react';
import SwipeItem from './swipeItem';

type ItemCloseTrigger = 'onItemMoved' | 'onButtonShowed';
type SwipeMode = 'single' | 'multiple';

type SwipeContextType = {
    mode: SwipeMode,
    closeTrigger: ItemCloseTrigger,
    setOpenedItemRef: (ref: SwipeItem, trigger: ItemCloseTrigger) => void,
    removeOpenedItemRef: (ref: SwipeItem) => void,
};

export const SwipeContext = React.createContext<SwipeContextType>({
    mode: 'single',
    closeTrigger: 'onItemMoved',
    setOpenedItemRef: () => {},
    removeOpenedItemRef: () => {},
});

type ProviderProps = {
    mode?: SwipeMode,
    closeTrigger?: ItemCloseTrigger,
};

const SwipeProvider = React.memo<ProviderProps>((props) => {
    const { mode = 'single', closeTrigger = 'onItemMoved', ...others } = props;

    const openedItemRef = React.useRef<SwipeItem | null>(null);

    const value = React.useMemo(
        () => ({
            mode,
            closeTrigger,
            setOpenedItemRef: (ref, trigger) => {
                if (trigger !== closeTrigger || mode === 'multiple') {
                    return;
                }
                openedItemRef.current && openedItemRef.current.close();
                openedItemRef.current = ref;
            },
            removeOpenedItemRef: (ref) => {
                if (ref === openedItemRef.current) {
                    openedItemRef.current = null;
                }
            },
        }),
        [closeTrigger, mode]
    );

    return <SwipeContext.Provider {...others} value={value} />;
});

export default SwipeProvider;
