import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')
const bucketName = process.env.TODO_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  try{

    const s3 = new AWS.S3({
      signatureVersion: 'v4'
    })
  
    const settings = { 
      Bucket: bucketName, 
      Key: todoId, 
      Expires: urlExpiration 
    }
  
    logger.info('PresignedUrl requested for',{settings});
  
    const uploadUrl = s3.getSignedUrl('putObject', settings)
  
    logger.info('PresignedUrl created',{
      uploadUrl
    });

    // build retrieval url
    const retrievalUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl,
        retrievalUrl
      })
    };
  }
  catch(e)
  {
    logger.error('Generating upload url caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
