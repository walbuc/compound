const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')
const validator = require('express-validator')
const {check, validationResult} = require('express-validator/check')
const AWS = require('aws-sdk')
const keys = require('../config/keys')
const axios = require('axios')

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
  check('firstName', 'first name doesnt exists').exists(),
  check('lastName', 'first name doesnt exists').exists(),
  check('email', 'Invalid email')
    .exists()
    .isEmail(),
]

const emailAlreadyExists = (data, email) => data[email]

router.post('/', validate(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({errors: errors.array()})
  const {firstName, lastName, email, token} = req.body
  axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${
        keys.secretRecaptcha
      }&response=${token}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      },
    )
    .then(res => {
      if (res.data.success) {
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
              res
                .status(200)
                .json({message: 'Your information has been saved.'})
            },
          )
        })
      } else {
        res.status(422).json({error: 'Captcha verification failed. Try again.'})
      }
    })
    .catch(err => {
      return res
        .status(500)
        .json({error: 'Has occurred an error, please try later.'})
    })
})

// path must route to lambda
app.use('/.netlify/functions/test', router)

module.exports = app
module.exports.handler = serverless(app)
