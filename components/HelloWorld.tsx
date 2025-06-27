// components/HelloWorld.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface HelloWorldProps {
  initialName?: string;
  showInput?: boolean;
  onNameChange?: (name: string) => void;
}

const HelloWorld: React.FC<HelloWorldProps> = ({
  initialName = "World",
  showInput = true,
  onNameChange,
}) => {
  const [name, setName] = useState(initialName);
  const [clickCount, setClickCount] = useState(0);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onNameChange?.(newName);
  };

  const handleButtonPress = () => {
    setClickCount((prev) => prev + 1);
  };

  const resetCounter = () => {
    setClickCount(0);
  };

  return (
    <View style={styles.container} testID="hello-world-container">
      <Text style={styles.title} testID="hello-text">
        Hello, {name}!
      </Text>

      <Text style={styles.subtitle} testID="welcome-text">
        Welcome to React Native Testing
      </Text>

      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Type your name here"
            testID="name-input"
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleButtonPress}
          testID="click-button"
        >
          <Text style={styles.buttonText}>Click me! ({clickCount})</Text>
        </TouchableOpacity>

        {clickCount > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetCounter}
            testID="reset-button"
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {clickCount > 0 && (
        <Text style={styles.counter} testID="click-counter">
          You clicked {clickCount} time{clickCount !== 1 ? "s" : ""}!
        </Text>
      )}

      {clickCount >= 5 && (
        <Text style={styles.achievement} testID="achievement-text">
          🎉 Achievement unlocked: Button Master!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  counter: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  achievement: {
    fontSize: 20,
    color: "#FF6B35",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});

export default HelloWorld;
