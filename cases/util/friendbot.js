import { fetch } from "./fetchShim";
import StellarSdk from "stellar-sdk";

const friends = [];
async function friendbot(keyPair) {
  const response = await fetch(
    `https://friendbot.stellar.org/?addr=${keyPair.publicKey()}`
  );
  friends.push(keyPair);
  expect(response.status).toEqual(200);
}

friendbot.destroyAllFriends = async function() {
  if (friends.length === 0) return;
  const accountData = await server.loadAccount(friends[0].publicKey());
  const transactionBuilder = new StellarSDK.TransactionBuilder(accountData, {
    fee: StellarSDK.BASE_FEE,
    networkPassphrase: StellarSDK.Networks.TESTNET
  });
  friends.forEach(keyPair => {
    transactionBuilder.addOperation(
      StellarSdk.Operations.accountMerge({
        destination: "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR",
        source: keyPair.publicKey()
      })
    );
  });

  const tx = transactionBuilder.setTimeout(30).build();
  friends.forEach(keyPair => {
    tx.sign(keyPair);
  });
  await server.submitTransaction(tx);
};

export default friendbot;
