const express = require("express");
const app = express();
app.use(express.json());

const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

app.post("/user/generateToken", (req, res) => {
  let companyName = "TM30";
  let clientName = req.body.clientName;
  let timeStamp = Date.now();

  function decrypt(text) {
    let iv = Buffer.from(text.iv, "hex");
    let encryptedText = Buffer.from(text.encryptedData, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  let uniqueCharacter = makeid(6);
  // console.log(uniqueCharacter)
  const data = companyName + clientName + timeStamp + uniqueCharacter;
  function encrypt() {
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(data.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  }
  const testEncrpt = encrypt();
  res.json({ status: true, token: testEncrpt });
  // console.log(uniqueCharacter)
});

app.post("/user/decryptToken", async (req, res) => {
  const text = req.body;
  try {
    async function decrypt() {
      let iv = Buffer.from(text.iv.toString(), "hex");
      let encryptedText = Buffer.from(text?.encryptedData.toString(), "hex");
      let decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(key),
        iv
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }
    const decrypted = await decrypt(text);

    res.json({ data: decrypted });
  } catch (error) {
    res.json({
      status: false,
      error: error.stack,
    });
  }
});

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});
