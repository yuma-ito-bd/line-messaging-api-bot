import {https, logger} from "firebase-functions";
import {defineString} from "firebase-functions/params";
import {
  Client, SignatureValidationFailed, validateSignature, WebhookRequestBody,
} from "@line/bot-sdk";

// 実行時に必要なパラメータを定義
const config = {
  channelSecret: defineString("CHANNEL_SECRET"),
  channelAccessToken: defineString("CHANNEL_ACCESS_TOKEN"),
};

export const webhook = https.onRequest((req, res) => {
  res.send("HTTP POST request sent to the webhook URL!");

  // 署名の検証
  const channelSecret = config.channelSecret.value();
  const signature = req.header("x-line-signature") ?? "";
  if (!validateSignature(req.rawBody, channelSecret, signature)) {
    throw new SignatureValidationFailed("invalid signature");
  }

  // LINE Messaging API Clientの初期化
  const lineClient = new Client({
    channelSecret: channelSecret,
    channelAccessToken: config.channelAccessToken.value(),
  });

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
