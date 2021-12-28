const AWS = require('aws-sdk-mock');

process.env.TABLE_NAME = 'VanityNumbers';

const event = {
    "Details": {
        "ContactData": {
            "CustomerEndpoint": {
                "Address": "+1234567890",
                "Type": "TELEPHONE_NUMBER"
            }
        }
    }
} 

describe('Test VanityNumberGeneratorFunction', () => {
  it('should generate 5 numbers', async () => {

    let numbers;
    AWS.mock('DynamoDB.DocumentClient', 'batchWrite', function(params, callback) {
      numbers = params.RequestItems.VanityNumbers;
      callback(null, {});
    });

    let handler = require('../../../vanitynumbergenerator.js');

    let res = await handler.generateVanityNumbers(event, null);

    console.log(res)
    expect(numbers.length).toBe(5);
    AWS.restore('DynamoDB.DocumentClient');
  });
});