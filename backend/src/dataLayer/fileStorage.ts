import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');

const bucketName = process.env.TODOS_ATTACHEMENT_S3_BUCKET;
const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export function getSignedUploadUrl(todoId: string) : string {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: 300
    })
}