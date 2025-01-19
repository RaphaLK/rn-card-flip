# React Native Flippable Card

A modernized version of lhandel's `react-native-card-flip` component with significant updates and improvements.

---

## **Key Updates**
- Removed dependency on `react-lifecycles-compat`.
- Refactored to use a functional component with `ForwardRef()`.
- Eliminated the use of `prop-types`.

---

## **Notes**
- Fully compatible as an in-place replacement for lhandel's `react-native-card-flip` component.
- The `onFlip` property has been removed.

---

## **Installation**
Install the package via npm or yarn:

```bash
npm install rn-flippable-card
# or
yarn add rn-flippable-card
```

---
## **Usage**

```javascript
import CardFlip from 'rn-flippable-card';

const App = () => {
  return (
    <CardFlip>
      <FrontSide />
      <BackSide />
    </CardFlip>
  );
};

const FrontSide = () => <View><Text>Front Side</Text></View>;
const BackSide = () => <View><Text>Back Side</Text></View>;
```