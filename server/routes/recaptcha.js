var express = require('express'),
    config = require('config'),
    router = express.Router(),
    User = require('../models/user'),
    Error = require('../controllers/error'),
    Recaptcha = require('recaptcha2'),
    recaptcha = new Recaptcha(config.recaptcha)
    passport = require('passport');

router.post('/', (req, res) => {
  recaptcha.validate(req.body.response)
      .then(() => {
        // valid
        res.json({ success: true })
      })
      .catch((errorCodes) => {
        console.error("recaptcha.js - router.post - / - recaptcha.validate.catch")
        console.error(recaptcha.translateErrors(errorCodes))
        res.json({success: false, errors: recaptcha.translateErrors(errorCodes)})
      })
});
router.get('/', (req, res) => {
  res.json({ key: config.recaptcha.siteKey}).end()
})

module.exports = router;
