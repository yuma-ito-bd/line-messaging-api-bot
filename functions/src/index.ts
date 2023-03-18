import {https, firestore, logger} from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const webhook = https.onRequest((req, res) => {
  res.send("HTTP POST request sent to the webhook URL!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const addMessage = https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await db
    .collection("messages")
    .add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original and creates
// an uppercase version of the message to /messages/:documentId/uppercase
export const makeUppercase = firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    logger.log("Uppercasing", context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside
    // a Functions such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({uppercase}, {merge: true});
  });
