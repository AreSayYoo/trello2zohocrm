const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const action = req.body?.action;
  const cardId = action?.data?.card?.id;

  if (!cardId) return res.status(200).end(); // No card = no action

  try {
    // Get full card data
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

    // Post to Zoho Flow webhook
    await axios.post(process.env.ZOHO_WEBHOOK_URL, cardRes.data);

    return res.status(200).send("Sent to Zoho");
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).send("Failed");
  }
};
