// components/__tests__/HelloWorld.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import HelloWorld from "../HelloWorld";

describe("HelloWorld Component", () => {
  it("renders with default props", () => {
    const { getByTestId, getByText } = render(<HelloWorld />);

    expect(getByTestId("hello-world-container")).toBeTruthy();
    expect(getByText("Hello, World!")).toBeTruthy();
    expect(getByText("Welcome to React Native Testing")).toBeTruthy();
    expect(getByTestId("name-input")).toBeTruthy();
    expect(getByText("Click me! (0)")).toBeTruthy();
  });

  it("renders with custom initial name", () => {
    const { getByText } = render(<HelloWorld initialName="John" />);

    expect(getByText("Hello, John!")).toBeTruthy();
  });

  it("hides input when showInput is false", () => {
    const { queryByTestId } = render(<HelloWorld showInput={false} />);

    expect(queryByTestId("name-input")).toBeNull();
  });

  it("updates name when input text changes", () => {
    const mockOnNameChange = jest.fn();
    const { getByTestId, getByText } = render(
      <HelloWorld onNameChange={mockOnNameChange} />
    );

    const input = getByTestId("name-input");
    fireEvent.changeText(input, "Alice");

    expect(getByText("Hello, Alice!")).toBeTruthy();
    expect(mockOnNameChange).toHaveBeenCalledWith("Alice");
  });

  it("increments counter when button is clicked", () => {
    const { getByTestId, getByText } = render(<HelloWorld />);

    const button = getByTestId("click-button");

    // Click once
    fireEvent.press(button);
    expect(getByText("Click me! (1)")).toBeTruthy();
    expect(getByText("You clicked 1 time!")).toBeTruthy();

    // Click again
    fireEvent.press(button);
    expect(getByText("Click me! (2)")).toBeTruthy();
    expect(getByText("You clicked 2 times!")).toBeTruthy();
  });

  it("shows reset button after first click", () => {
    const { getByTestId, queryByTestId } = render(<HelloWorld />);

    // Reset button should not be visible initially
    expect(queryByTestId("reset-button")).toBeNull();

    // Click the main button
    fireEvent.press(getByTestId("click-button"));

    // Reset button should now be visible
    expect(getByTestId("reset-button")).toBeTruthy();
  });

  it("resets counter when reset button is clicked", () => {
    const { getByTestId, getByText, queryByTestId } = render(<HelloWorld />);

    const clickButton = getByTestId("click-button");

    // Click to increment counter
    fireEvent.press(clickButton);
    fireEvent.press(clickButton);
    fireEvent.press(clickButton);

    expect(getByText("Click me! (3)")).toBeTruthy();

    // Reset the counter
    const resetButton = getByTestId("reset-button");
    fireEvent.press(resetButton);

    expect(getByText("Click me! (0)")).toBeTruthy();
    expect(queryByTestId("reset-button")).toBeNull();
    expect(queryByTestId("click-counter")).toBeNull();
  });

  it("shows achievement after 5 clicks", () => {
    const { getByTestId, queryByTestId } = render(<HelloWorld />);

    const button = getByTestId("click-button");

    // Achievement should not be visible initially
    expect(queryByTestId("achievement-text")).toBeNull();

    // Click 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.press(button);
    }

    // Achievement should now be visible
    expect(getByTestId("achievement-text")).toBeTruthy();
  });

  it("displays correct singular/plural text for clicks", () => {
    const { getByTestId, getByText } = render(<HelloWorld />);

    const button = getByTestId("click-button");

    // One click - singular
    fireEvent.press(button);
    expect(getByText("You clicked 1 time!")).toBeTruthy();

    // Multiple clicks - plural
    fireEvent.press(button);
    expect(getByText("You clicked 2 times!")).toBeTruthy();
  });

  it("handles empty name input correctly", () => {
    const { getByTestId, getByText } = render(<HelloWorld />);

    const input = getByTestId("name-input");
    fireEvent.changeText(input, "");

    expect(getByText("Hello, !")).toBeTruthy();
  });

  it("calls onNameChange callback when provided", () => {
    const mockCallback = jest.fn();
    const { getByTestId } = render(<HelloWorld onNameChange={mockCallback} />);

    const input = getByTestId("name-input");
    fireEvent.changeText(input, "Test Name");

    expect(mockCallback).toHaveBeenCalledWith("Test Name");
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("works without onNameChange callback", () => {
    const { getByTestId, getByText } = render(<HelloWorld />);

    const input = getByTestId("name-input");

    // Should not throw error when no callback provided
    expect(() => {
      fireEvent.changeText(input, "No Callback");
    }).not.toThrow();

    expect(getByText("Hello, No Callback!")).toBeTruthy();
  });

  it("maintains state independently for multiple instances", () => {
    // Test first instance
    const {
      getByTestId: getByTestId1,
      getByText: getByText1,
      unmount: unmount1,
    } = render(<HelloWorld initialName="User1" />);

    fireEvent.press(getByTestId1("click-button"));
    fireEvent.press(getByTestId1("click-button"));

    expect(getByText1("Click me! (2)")).toBeTruthy();
    expect(getByTestId1("click-counter")).toBeTruthy();

    // Clean up first instance
    unmount1();

    // Test second instance - should start fresh
    const { getByTestId: getByTestId2, getByText: getByText2 } = render(
      <HelloWorld initialName="User2" />
    );

    fireEvent.press(getByTestId2("click-button"));

    // Second instance should have its own independent state
    expect(getByText2("Click me! (1)")).toBeTruthy();
    expect(getByTestId2("click-counter")).toBeTruthy();
    expect(getByText2("You clicked 1 time!")).toBeTruthy();
  });

  it("updates input placeholder correctly", () => {
    const { getByTestId } = render(<HelloWorld />);

    const input = getByTestId("name-input");
    expect(input.props.placeholder).toBe("Type your name here");
  });

  it("has correct accessibility properties", () => {
    const { getByTestId } = render(<HelloWorld />);

    // Check that important elements have testIDs for accessibility
    expect(getByTestId("hello-world-container")).toBeTruthy();
    expect(getByTestId("hello-text")).toBeTruthy();
    expect(getByTestId("welcome-text")).toBeTruthy();
    expect(getByTestId("name-input")).toBeTruthy();
    expect(getByTestId("click-button")).toBeTruthy();
  });
});
