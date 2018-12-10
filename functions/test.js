const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')
const validator = require('express-validator')
const {body, validationResult} = require('express-validator/check')
const AWS = require('aws-sdk')
const keys = require('../config/keys')

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
})

const S3Params = {
  Bucket: 'data-store-blog',
  Key: 'users/users.json',
}

const router = express.Router()
app.use(bodyParser.json())
app.use(validator())

const validate = () => [
  body('firstName', 'first name doesnt exists').exists(),
  body('lastName', 'first name doesnt exists').exists(),
  body('email', 'Invalid email')
    .exists()
    .isEmail(),
]

const emailAlreadyExists = (data, email) => data[email]

router.post('/', (req, res) => {
  // const errors = validationResult(req)
  // if (!errors.isEmpty()) return res.status(422).json({errors: errors.array()})
  const {firstName, lastName, email} = req.body
  s3.getObject(S3Params, function(err, data) {
    if (err)
      return res
        .status(500)
        .json({error: 'Has occurred an error, please try later.'})

    let object = JSON.parse(data.Body.toString())

    if (emailAlreadyExists(object, email)) {
      return res.status(422).json({error: 'Email already exists.'})
    }
    const newDataobject = Object.assign({}, object, {
      [email]: {firstName, lastName, email},
    })
    s3.putObject(
      {
        Bucket: S3Params['Bucket'],
        Key: S3Params['Key'],
        Body: JSON.stringify({
          ...newDataobject,
        }),
        ContentType: 'application/json',
      },
      function(err, data) {
        console.log(JSON.stringify(err) + ' ' + JSON.stringify(data))
        res.status(200).json({message: 'Your information has been saved.'})
      },
    )
  })
})

// path must route to lambda
app.use('/.netlify/functions/test', router)

module.exports = app
module.exports.handler = serverless(app)
