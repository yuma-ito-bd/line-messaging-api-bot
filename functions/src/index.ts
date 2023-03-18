import {https, logger} from "firebase-functions";
import {WebhookRequestBody, Client} from "@line/bot-sdk";

const lineClient = new Client({
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? "invalid token",
});

export const webhook = https.onRequest((req, res) => {
  res.send("HTTP POST request sent to the webhook URL!");

  // ユーザーがbotに送ったメッセージをそのまま返す
  const {events} = req.body as WebhookRequestBody;
  logger.debug(JSON.stringify(events));
  events.forEach((event) => {
    switch (event.type) {
    case "message": {
      const {replyToken, message} = event;
      if (message.type === "text") {
        lineClient.replyMessage(replyToken, {type: "text", text: message.text});
      }

      break;
    }
    default:
      break;
    }
  });
});
