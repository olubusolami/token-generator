const express = require("express");
const app = express();
app.use(express.json());
const { db } = require("./model.config");

/* =============== DEFAULT VALUES ================== */

const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

/* ====================== UTILITIES ======================== */
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/* ======================= MakeId =================== */
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

/* ================ ENCRYPT DATA ================ */
function encrypt(data, iv, key) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(data.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

app.post("/user/generateToken", async (req, res) => {
  let companyName = req.body.companyName;
  let projectName = req.body.clientName;

  const checkProjectName = await db.apiKeyForTM30.findOne({
    where: {
      projectName: projectName || null,
    },
  });
  console.log(checkProjectName);

  if (checkProjectName) {
    res
      .status(400)
      .json({ status: false, message: "Project Name Already Exists" });
    return;
  }

  const uniqueCharacter = makeid(6);
  console.log(uniqueCharacter);

  const apiData = await db.apiKeyForTM30.create({
    companyName: req.body.companyName,
    projectName: req.body.projectName,
    uniqueCharacter,
  });
  console.log(apiData);

  const data = companyName + projectName + apiData.createdAt + uniqueCharacter;
  console.log(data);

  let { encryptedData, iv: fetchedIV } = encrypt(data, iv, key);
  console.log(encryptedData);

  await db.apiKeyForTM30.update(
    { iv: fetchedIV, encryptedData: encryptedData },
    {
      where: {
        projectName: req.body.projectName,
      },
    }
  );

  res.json({ status: true, token: { encryptedData, iv: fetchedIV } });
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
db.sequelize.sync({ alter: "force" });

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});
