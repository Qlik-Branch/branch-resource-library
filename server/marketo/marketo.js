const config = require('../../config')
const Marketo = require('node-marketo-rest')
const git = require('github')
const parse = require("parse-name").parse
const GitHub = new git({
  // required
  version: "3.0.0",
  // optional
  debug: false,
  protocol: "https",
  host: "api.github.com", // should be api.github.com for GitHub
  pathPrefix: "", // for some GHEs; none for GitHub
  timeout: 5000,
  headers: {
    "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
  }
})

module.exports = {
  syncUser: (user) => {
    return new Promise((resolve, reject) => {
      const marketo = new Marketo(config.marketo)
      let nameInfo = parse(user.fullname)
      const testLead = {
        firstName: nameInfo.first,
        lastName: nameInfo.last,
        company: user.company,
        email: user.email,
        country: user.country,
        leadSource: 'WEB - Web Activity',
        Lead_Source_Detail_Mirror__c: 'WEB - Branch',
        Web_Activity_Source__c: 'WA'
      }
      marketo.lead.createOrUpdate([testLead])
          .then(() => { resolve() })
    })
  }
}
