const { Sequelize } = require("sequelize");

module.exports = (sequelize, dataType) => {
  const apiKeyForTM30 = sequelize.define("apiKeyForTM30", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    companyName: {
      type: dataType.STRING,
      allowNull: false,
    },
    projectName: {
      type: dataType.STRING,
      allowNull: false,
      unique: true,
    },
    iv: {
      type: dataType.STRING
    },
    encryptedData: { type: dataType.STRING },
  });
  return apiKeyForTM30;
};
