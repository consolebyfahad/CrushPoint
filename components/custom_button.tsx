import { color, font } from "@/utils/constants";
import React, { useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
  icon?: React.ReactElement<{ color?: string }>;
  rightIcon?: React.ReactElement<{ color?: string }>;
  style?: any;
  fontstyle?: any;
  count?: number;
}

export default function CustomButton({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
  variant = "primary",
  icon,
  rightIcon,
  style,
  fontstyle,
  count,
}: CustomButtonProps) {
  const buttonDisabled =
    typeof isDisabled === "boolean" ? isDisabled || isLoading : isLoading;
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    if (variant === "primary") return styles.primaryButton;
    if (variant === "secondary" && isPressed)
      return styles.secondaryButtonPressed;
    return styles.secondaryButton;
  };

  const getTextStyle = () => {
    if (variant === "primary") return styles.primaryText;
    if (variant === "secondary" && isPressed)
      return styles.secondaryTextPressed;
    return styles.secondaryText;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={buttonDisabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonBase,
        getButtonStyle(),
        buttonDisabled && styles.disabledButton,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? color.white : color.black}
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconWrapper}>
              {React.cloneElement(icon, {
                color:
                  variant === "primary"
                    ? color.white
                    : isPressed
                    ? color.white
                    : color.black,
              })}
            </View>
          )}

          {/* Count before text for secondary */}
          {variant === "secondary" && count && (
            <Text style={styles.count}>{count}</Text>
          )}

          <Text
            style={[
              getTextStyle(),
              buttonDisabled && styles.disabledText,
              fontstyle,
            ]}
          >
            {title}
          </Text>

          {/* Count after text for primary */}
          {count && (
            <Text
              style={[
                styles.count,
                title === "Outgoing" && styles.outgoingCount,
              ]}
            >
              {count}
            </Text>
          )}

          {rightIcon && <View>{React.cloneElement(rightIcon)}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: color.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: color.gray87,
  },
  secondaryButtonPressed: {
    backgroundColor: color.black,
    borderWidth: 1,
    opacity: 1,
  },
  disabledButton: {
    backgroundColor: color.gray94,
  },
  disabledText: {
    color: color.gray900,
  },
  count: {
    backgroundColor: color.primary,
    color: color.white,
    fontSize: 12,
    fontFamily: font.medium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
    minWidth: 20,
    borderWidth: 1,
    borderColor: color.white,
  },
  outgoingCount: {
    backgroundColor: color.white,
    color: color.primary,
    borderWidth: 1,
    borderColor: color.primary,
  },

  primaryText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.white,
  },
  secondaryText: {
    fontSize: 16,
    fontFamily: font.medium,
    color: color.gray14,
  },
  secondaryTextPressed: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
});
