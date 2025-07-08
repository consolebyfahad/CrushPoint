import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  AppleAuthProvider,
  getAuth,
  signInWithCredential,
} from "@react-native-firebase/auth";

export default async function onAppleButtonPress() {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  if (!appleAuthRequestResponse.identityToken) {
    throw new Error("Apple Sign-In failed - no identity token returned");
  }

  const { identityToken, nonce, fullName, email } = appleAuthRequestResponse;
  const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

  const userCredential = await signInWithCredential(getAuth(), appleCredential);

  return {
    userCredential,
    identityToken,
    userData: {
      name: fullName?.givenName + " " + fullName?.familyName,
      email,
    },
  };
}
