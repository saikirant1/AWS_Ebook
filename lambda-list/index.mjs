import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const REGION     = process.env.AWS_REGION  || "us-east-1";
const TABLE_NAME = process.env.TABLE_NAME  || "ContactMessages";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  try {
    const qs    = event?.queryStringParameters || {};
    const limit = Math.min(parseInt(qs.limit || "25", 10), 100);

    const scanInput = {
      TableName: TABLE_NAME,
      Limit: limit,
      ProjectionExpression: "#id, #n, email, phone, message, createdAt",
      ExpressionAttributeNames: { "#id": "id", "#n": "name" },
    };

    // Pagination — lastKey is base64-encoded JSON of the DynamoDB LastEvaluatedKey
    if (qs.lastKey) {
      try {
        scanInput.ExclusiveStartKey = JSON.parse(
          Buffer.from(qs.lastKey, "base64").toString("utf8")
        );
      } catch {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: "Invalid lastKey" }),
        };
      }
    }

    const res = await ddb.send(new ScanCommand(scanInput));

    // Sort by createdAt descending
    const items = (res.Items || []).sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    );

    const body = {
      items,
      lastKey: res.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(res.LastEvaluatedKey)).toString("base64")
        : null,
    };

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(body),
    };
  } catch (e) {
    console.error("Error:", e);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Internal error" }),
    };
  }
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token",
    "Cache-Control": "no-store",
  };
}
