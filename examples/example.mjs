// !!!
// If the value of the environment variable LOCAL_TEST is set,
// it will be tested with SimplyImitatedSQS

import  process from 'process'
import AWS from 'aws-sdk'
import SimplyImitatedSQS from '@abetomo/simply-imitated-sqs'

const sqs = (() => {
  // !!! If environment variable is set, use SimplyImitatedSQS
  if (process.env.LOCAL_TEST === '1') {
    return new SimplyImitatedSQS()
  }
  return new AWS.SQS({
    region: 'us-east-1',
    apiVersion: '2012-11-05'
  })
})()

// Once you create the sqs instance, you do not need to modify any other code.
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/xxx/test'

// sendMessage
try {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: 'hoge' + (new Date()).toString()
  }
  const sendRes = await sqs.sendMessage(params).promise()
  console.log('+++\n%s\n+++', JSON.stringify(sendRes, null, ' '))
} catch (err) {
  console.error(err)
}

// receiveMessage
let message = null
try {
  const params = { QueueUrl: queueUrl }
  message = await sqs.receiveMessage(params).promise()
  console.log('===\n%s\n===', JSON.stringify(message, null, ' '))
} catch (err) {
  console.error(err)
}

// deleteMessage
try {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.Messages[0].ReceiptHandle
  }
  const delRes = await sqs.deleteMessage(params).promise()
  console.log('---\n%s\n---', JSON.stringify(delRes, null, ' '))
} catch (err) {
  console.error(err)
}
