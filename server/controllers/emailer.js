config = require('config');
nodemailer = require('nodemailer').createTransport(config.mailTransport);
Templater = require('./templater');
MailText = require('./mailText');

module.exports = {
  sendMail: function(action, entity, data, callbackFn){
    var templateOptions = MailText[action][entity];
    //var emailHTMLHeader = '<style>font-family:Arial,sans-serif;font-size:12px;</style><img src="/resources/qlik-typemarks/QlikBranchTypemark-Horizontal-Web.png" height="50" width="267" border="0"><br><br>';
    if(templateOptions){
      var toTemplate = new Templater(templateOptions.to);
      var subjectTemplate = new Templater(templateOptions.subject);
      var htmlTemplate = new Templater(templateOptions.html);
      var mailOptions = {
        from: 'Qlik Branch <svc-branchadminmail@qlik.com>',
        sender: 'Qlik Branch <svc-branchadminmail@qlik.com>',
        to: toTemplate.getHTML(data),
        subject: subjectTemplate.getHTML(data),
        html: MailText["mailTemplate"]["header"].html + htmlTemplate.getHTML(data)
      }
      nodemailer.sendMail(mailOptions, function(error, info){
        if(error){
          console.error("emailer.js - sendMail - nodemailer.sendMail")
          return console.error(error)
        }
        else{
          callbackFn.call(null);
        }
      });
    }
  },
  sendCustomMail: function(mailOptions, callbackFn){
    nodemailer.sendMail(mailOptions, function(error, info){
      if(error){
        console.error("emailer.js - sendCustomMail - nodemailer.sendMail")
        return console.error(error)
      }
      else{
        callbackFn.call(null);
      }
    });
  }
}
