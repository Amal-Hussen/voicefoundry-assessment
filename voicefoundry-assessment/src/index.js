const AWS = require("aws-sdk");
const uuid = require("uuid");

const db = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME;
const numberToLetters = [
  "0",
  "1",
  "ABC",
  "DEF",
  "GHI",
  "JKL",
  "MNO",
  "PQRS",
  "TUV",
  "WXYZ",
];

exports.generateVanityNumbers = async (event, context) => {
  console.log("Begin generate vanity numbers");

  const customerNumber = event.Details.ContactData.CustomerEndpoint.Address;

  console.log(`Generating vanity numbers for: ${customerNumber}`);
  const vanityNumbers = generateNumbers(customerNumber);

  console.log(`Writing vanity numbers for ${customerNumber} to db`);
  await writeToDb(customerNumber, vanityNumbers);

  
  return {
    NumberOne: vanityNumbers[0].split("").join(" "),
    NumberTwo: vanityNumbers[1].split("").join(" "),
    NumberThree: vanityNumbers[2].split("").join(" "),
  };
};


function generateNumbers(phoneNumber) {
  const prefix = phoneNumber.slice(1, -7);
  const suffixArray = phoneNumber.slice(-7).split("");

  const vanityNumbers = [];
  for (let i = 0; i < 5; i++) {
    const vanityNumber = suffixArray
      .map((digit) => {
        const letters = numberToLetters[digit];
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");

    vanityNumbers.push(prefix + vanityNumber);
  }

  return vanityNumbers;
}

async function writeToDb(originalNumber, vanityNumbers) {
  const date = new Date().toISOString();

  const requests = vanityNumbers.map((vanityNumber) => {
    return {
      PutRequest: {
        Item: {
          date,
          id: uuid.v4(),
          number: originalNumber,
          vanityNumber: vanityNumber,
        },
      },
    };
  });

  const params = {
    RequestItems: {
      [TableName]: requests,
    },
  };
  return new Promise((resolve, reject) => {
    db.batchWrite(params, (err, data) => {
      if (err) reject(err);

      resolve(data);
    });
  });
}