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
}

export default function CustomButton({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
  variant = "primary",
  icon,
  rightIcon,
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
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View>{React.cloneElement(rightIcon)}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: color.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: color.gray100,
  },
  secondaryButtonPressed: {
    backgroundColor: color.black,
    borderWidth: 1,
    opacity: 1,
  },
  disabledButton: {
    backgroundColor: color.gray100,
  },
  primaryText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.white,
  },
  secondaryText: {
    fontSize: 16,
    fontFamily: font.semiBold,
    color: color.gray400,
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
