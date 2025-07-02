import { parsePhoneNumberFromString } from "libphonenumber-js";

export const formatPhoneNumber = (input: string) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(input);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
    return input;
  } catch {
    return input;
  }
};
