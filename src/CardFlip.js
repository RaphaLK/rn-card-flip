/***********
 * Custom Cardflip component since the repo is old
 */
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Platform, StyleSheet, Animated } from "react-native";

const CardFlip = forwardRef(
  (
    {
      style = {},
      duration = 500,
      flipZoom = 0.09,
      flipDirection = "y",
      perspective = 800,
      onFlipStart = () => {},
      onFlipEnd = () => {},
      children,
    },
    ref
  ) => {
    const [side, setSide] = useState(0);
    const [sides, setSides] = useState(React.Children.toArray(children));

    const progress = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;
    const zoom = useRef(new Animated.Value(0)).current;

    const [rotateOrientation, setRotateOrientation] = useState("");
    const [currentDuration, setDuration] = useState(duration);

    useEffect(() => {
      setDuration(duration);
      setSides(React.Children.toArray(children));
    }, [duration, children]);

    const tip = (customConfig) => {
      const defaultConfig = {
        direction: "left",
        progress: 0.05,
        duration: 150,
      };
      const config = { ...defaultConfig, ...customConfig };
      const {
        direction,
        progress: tipProgress,
        duration: tipDuration,
      } = config;

      const sequence = [];
      if (direction === "right") {
        sequence.push(
          Animated.timing(rotation, {
            toValue: { x: 0, y: side === 0 ? 50 + tipProgress * 50 : 90 },
            duration: tipDuration,
            useNativeDriver: true,
          })
        );
      } else {
        sequence.push(
          Animated.timing(rotation, {
            toValue: { x: 0, y: side === 0 ? 50 - tipProgress * 50 : 90 },
            duration: tipDuration,
            useNativeDriver: true,
          })
        );
      }
      sequence.push(
        Animated.timing(rotation, {
          toValue: { x: 0, y: side === 0 ? 50 : 100 },
          duration: tipDuration,
          useNativeDriver: true,
        })
      );
      Animated.sequence(sequence).start();
    };

    const jiggle = (customConfig = {}) => {
      const defaultConfig = { count: 2, duration: 100, progress: 0.05 };
      const config = { ...defaultConfig, ...customConfig };

      const {
        count,
        duration: jiggleDuration,
        progress: jiggleProgress,
      } = config;

      const sequence = [];
      for (let i = 0; i < count; i++) {
        sequence.push(
          Animated.timing(rotation, {
            toValue: { x: 0, y: side === 0 ? 50 + jiggleProgress * 50 : 90 },
            duration: jiggleDuration,
            useNativeDriver: true,
          })
        );

        sequence.push(
          Animated.timing(rotation, {
            toValue: { x: 0, y: side === 0 ? 50 - jiggleProgress * 50 : 110 },
            duration: jiggleDuration,
            useNativeDriver: true,
          })
        );
      }
      sequence.push(
        Animated.timing(rotation, {
          toValue: { x: 0, y: side === 0 ? 50 : 100 },
          duration: jiggleDuration,
          useNativeDriver: true,
        })
      );
      Animated.sequence(sequence).start();
    };

    const flip = () => {
      if (flipDirection === "y") {
        flipY();
      } else {
        flipX();
      }
    };

    const flipY = () => {
      _flipTo({ x: 50, y: side === 0 ? 100 : 50 });
      setSide(side === 0 ? 1 : 0);
      setRotateOrientation("y");
    };

    const flipX = () => {
      _flipTo({ y: 50, x: side === 0 ? 100 : 50 });
      setSide(side === 0 ? 1 : 0);
      setRotateOrientation("x");
    };

    const _flipTo = (toValue) => {
      onFlipStart(side === 0 ? 1 : 0);
      Animated.parallel([
        Animated.timing(progress, {
          toValue: side === 0 ? 100 : 0,
          duration: currentDuration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(zoom, {
            toValue: 100,
            duration: currentDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(zoom, {
            toValue: 0,
            duration: currentDuration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotation, {
          toValue,
          duration: currentDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFlipEnd(side === 0 ? 1 : 0);
      });
    };

    const getCardATransformation = () => {
      const sideAOpacity = progress.interpolate({
        inputRange: [50, 51],
        outputRange: [100, 0],
        extrapolate: "clamp",
      });

      const sideATransform = {
        opacity: sideAOpacity,
        zIndex: side === 0 ? 1 : 0,
        transform: [{ perspective }],
      };

      if (rotateOrientation === "x") {
        const aXRotation = rotation.x.interpolate({
          inputRange: [0, 50, 100, 150],
          outputRange: ["-180deg", "0deg", "180deg", "0deg"],
          extrapolate: "clamp",
        });
        sideATransform.transform.push({ rotateX: aXRotation });
      } else {
        const aYRotation = rotation.y.interpolate({
          inputRange: [0, 50, 100, 150],
          outputRange: ["-180deg", "0deg", "180deg", "0deg"],
          extrapolate: "clamp",
        });
        sideATransform.transform.push({ rotateY: aYRotation });
      }
      return sideATransform;
    };

    const getCardBTransformation = () => {
      const sideBOpacity = progress.interpolate({
        inputRange: [50, 51],
        outputRange: [0, 100],
        extrapolate: "clamp",
      });

      const sideBTransform = {
        opacity: sideBOpacity,
        zIndex: side === 0 ? 0 : 1,
        transform: [{ perspective: -1 * perspective }],
      };

      if (rotateOrientation === "x") {
        const bXRotation = rotation.x.interpolate({
          inputRange: [0, 50, 100, 150],
          outputRange: ["0deg", "-180deg", "-360deg", "180deg"],
          extrapolate: "clamp",
        });
        sideBTransform.transform.push({ rotateX: bXRotation });
      } else {
        const bYRotation =
          Platform.OS === "ios"
            ? rotation.y.interpolate({
                inputRange: [0, 50, 100, 150],
                outputRange: ["0deg", "180deg", "0deg", "-180deg"],
                extrapolate: "clamp",
              })
            : rotation.y.interpolate({
                inputRange: [0, 50, 100, 150],
                outputRange: ["0deg", "-180deg", "0deg", "180deg"],
                extrapolate: "clamp",
              });
        sideBTransform.transform.push({ rotateY: bYRotation });
      }
      return sideBTransform;
    };

    const cardZoom = zoom.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 1 + flipZoom],
      extrapolate: "clamp",
    });

    const scaling = {
      transform: [{ scale: cardZoom }],
    };

    useImperativeHandle(ref, () => ({
      flip,
      flipX,
      flipY,
      jiggle,
      tip,
    }));

    return (
      <Animated.View style={[style, scaling]}>
        <Animated.View style={[styles.cardContainer, getCardATransformation()]}>
          {sides[0]}
        </Animated.View>
        <Animated.View style={[styles.cardContainer, getCardBTransformation()]}>
          {sides[1]}
        </Animated.View>
      </Animated.View>
    );
  }
);

export default CardFlip;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
