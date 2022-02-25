# React Native Swipe Item

A swipe item for react-native. Support both iOS and Android.

<img src="https://raw.githubusercontent.com/ambisign-gavin/react-native-swipe-item/master/ios-demo.gif" width="310">

<img src="https://raw.githubusercontent.com/ambisign-gavin/react-native-swipe-item/master/android-demo.gif" width="310">

## Example

See [react-native-swipe-item-demo](https://github.com/ambisign-gavin/react-native-swipe-item-demo).

## Installation

```sh

npm i --save react-native-swipe-item

```

- **if you use react-native 0.62.0 or newer version, please install `0.5.0`.**

## Usage

You can use the `SwipeButtonsContainer` to wrap buttons that you want to show when users swipe the item, and pass it to props.

```javascript
import { SwipeItem, SwipeButtonsContainer, SwipeProvider } from 'react-native-swipe-item';

export default function SwipeButtonCustom() {

    const leftButton = (
        <SwipeButtonsContainer
            style={{
                alignSelf: 'center',
                aspectRatio: 1,
                flexDirection: 'column',
                padding: 10,
            }}
            
        >
            <TouchableOpacity
                onPress={() => console.log('left button clicked')}
            >
                <Text>Click me !</Text>
            </TouchableOpacity>
        </SwipeButtonsContainer>
    );
  
    return (
        <SwipeProvider>
            <SwipeItem
                style={styles.button}
                swipeContainerStyle={styles.swipeContentContainerStyle}
                leftButtons={leftButton}
            >
                <Text>
                    Swipe me!
                </Text>
            </SwipeItem>
            <SwipeItem>
                ...
            </SwipeItem>
        </SwipeProvider>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '80%',
        height: 100,
        alignSelf: 'center',
        marginVertical: 5,
    },
    swipeContentContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderColor: '#e3e3e3',
        borderWidth: 1,
    }
});

```

## Components

* **SwipeProvider** `since v0.6.0`

    - [props](#SwipeProvider)

* **SwipeItem**

    - [props](#SwipeItem)
    
    - [ref methods](#SwipeItemRefMethods)

* **SwipeButtonsContainer**

    - [props](#SwipeButtonsContainer)


### `SwipeProvider` Props<a id='SwipeProvider'></a>

* [mode](#SwipeProvider_mode)

* [closeTrigger](#SwipeProvider_closeTrigger)

<a id="SwipeProvider_mode">**`mode`**</a>

Swipe items mode, default is `single`.

| TYPE | REQUIRED |
| --- | --- |
| `single` \| `multiple` | No |

* `single`:  only allow one swipe item to be opened. The opened swipe item would be automatically closed when the new swipe item triggers the close event. (see the [closeTrigger](#SwipeProvider_closeTrigger) prop for more detail.)

* `multiple`:  allow multiple swipe items to be opened.

---

<a id="SwipeProvider_closeTrigger">**`closeTrigger`**</a>

The trigger for automatically closed swipe item , only works when the mode prop is single, default is `onItemMoved`.

| TYPE | REQUIRED |
| --- | --- |
| `onItemMoved` \| `onButtonShowed` | No |

* `onItemMoved`: when the swipe item is moved, the opened one will be closed.

* `onButtonShowed`: when the swipe item button is showing, the opened one will be closed.

---


### `SwipeItem` Props<a id='SwipeItem'></a>

* [style](#style)

* [swipeContainerStyle](#swipeContainerStyle)

* [leftButtons](#leftButtons)

* [rightButtons](#rightButtons)

* [containerView](#containerView)

* [disableSwipeIfNoButton](#disableSwipeIfNoButton)

* [onSwipeInitial](#onSwipeInitial)

* [onLeftButtonsShowed](#onLeftButtonsShowed)

* [onRightButtonsShowed](#onRightButtonsShowed)

* [onMovedToOrigin](#onMovedToOrigin)

<a id="style">**`style`**</a>

These styles will be applied to the swipe item layout.

| TYPE | REQUIRED |
| --- | --- |
| style | No |

---

<a id="swipeContainerStyle">**`swipeContainerStyle`**</a>

These styles will be applied to the swipe item container which user swipe.

Example:

```js
return (
        <SwipeItem swipeContainerStyle={styles.swipeContentContainerStyle} >
        </SwipeItem>
    );
}

const styles = StyleSheet.create({
    swipeContentContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderColor: '#e3e3e3',
        borderWidth: 1,
    }
});
```

| TYPE | REQUIRED |
| --- | --- |
| style | No |

---

<a id="leftButtons">**`leftButtons`**</a>

Buttons that want to show on the left when the item swiped to right.

| TYPE | REQUIRED |
| --- | --- |
| `SwipeButtonsContainer` | No |

---

<a id="rightButtons">**`rightButtons`**</a>

Buttons that want to show on the right when the item swiped to left.

| TYPE | REQUIRED |
| --- | --- |
| `SwipeButtonsContainer` | No |

---

<a id="containerView">**`containerView`**</a>

The component for the swipe item.

*   *Before RN 0.57.0, the child view would be clipped by parent view when the child view layout out of the parent. Recommend to use [ViewOverflow](https://github.com/entria/react-native-view-overflow) plugin to solve this problem.*

Example:

```js
import ViewOverflow from 'react-native-view-overflow';
...
...
export default function SwipeButtonCustom() {  
    return (
        <SwipeItem
            style={styles.button}
            swipeContainerStyle={styles.swipeContentContainerStyle}
            containerView={ViewOverflow}
        >
            <Text>
                Swipe me!
            </Text>
        </SwipeItem>
    );
}
...
```

| TYPE | REQUIRED | PLATFORM |
| --- | --- | --- |
| `ViewOverflow` | Yes | Android |

---

<a id="onSwipeInitial">**`onSwipeInitial`**</a>

This prop will be called when the item started swipe from the origin position, and the `SwipeItem` reference passed as an argument.

---

<a id="onLeftButtonsShowed">**`onLeftButtonsShowed`**</a>

This prop will be called when left buttons showed, and the `SwipeItem` reference passed as an argument.

---

<a id="onRightButtonsShowed">**`onRightButtonsShowed`**</a>

This prop will be called when right buttons showed, and the `SwipeItem` reference passed as an argument.

---

<a id="onMovedToOrigin">**`onMovedToOrigin`**</a>

This prop will be called when the item moved to the origin, and the `SwipeItem` reference passed as an argument.

---

<a id="disableSwipeIfNoButton">**`disableSwipeIfNoButton`**</a>

`since v0.4`

Disable the swipe feature when there are no buttons.

| TYPE | REQUIRED |
| --- | --- |
| `boolean` | No |

---

### `SwipeItem` Ref Methods<a id="SwipeItemRefMethods"></a>

* [close](#close)

<a id="close">**`close`**</a>

Close the swipe item.

Example:

```

const itemRef = useRef(null);
...
itemRef.current.close();
...
<SwipeItem ref={itemRef} >
    ...
</SwipeItem>

```

---

### `SwipeButtonsContainer` Props<a id='SwipeButtonsContainer'></a>

**This component extends react-native View props.**


## License

MIT
