const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const action = req.body?.action;
  const cardId = action?.data?.card?.id;
  const listAfter = action?.data?.listAfter?.name;

  const TARGET_LIST_NAME = "Billing"; // 👈 Change this to match your column title

  // Only act when a card moves to that specific list
  if (action?.type === "updateCard" && listAfter === TARGET_LIST_NAME) {
    try {
      const cardRes = await axios.get(
        `https://api.trello.com/1/cards/${cardId}`,
        {
          params: {
            key: process.env.TRELLO_KEY,
            token: process.env.TRELLO_TOKEN,
            fields: "all",
            attachments: true,
            members: true,
          },
        }
      );

      const fullCardData = cardRes.data;

      await axios.post(process.env.ZOHO_WEBHOOK_URL, fullCardData);

      console.log(`✅ Card "${fullCardData.name}" sent to Zoho`);
      return res.status(200).send("Card sent to Zoho");
    } catch (err) {
      console.error("❌ Failed to send card:", err.message);
      return res.status(500).send("Error");
    }
  }

  return res.status(200).send("No action taken");
};
