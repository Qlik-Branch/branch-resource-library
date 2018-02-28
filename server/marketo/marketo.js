const config = require('config')
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
      try {
        if(config.marketo == null) {
          resolve()
        } else {
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
            Web_Activity_Source__c: 'WA',
            Unsubscribed: user.unsubscribed
          }
          marketo.lead.createOrUpdate([testLead])
              .then(() => { resolve() })
              .catch((err) => {
                console.error("marketo.js - syncUser - marketo.lead.createOrUpdate.catch")
                console.error(err)
                resolve()
              })
        }
      } catch(e) {
        console.error("marketo.js - syncUser - try/catch")
        console.error(e)
        resolve()
      }
    })
  },
  updateIncentive: (user) => {
    return new Promise((resolve, reject) => {
      try {
        if(config.marketo == null) {
          resolve(false)
        } else {
          const marketo = new Marketo(config.marketo)
          const testLead = {
            email: user.email,
            Incentive__c: 'WEB - Branch'
          }
          marketo.lead.createOrUpdate([testLead])
              .then(() => { resolve(true) })
              .catch((err) => {
                console.error("marketo.js - updateIncentive - marketo.lead.createOrUpdate.catch")
                console.error(err)
                resolve(false)
              })
        }
      } catch(e) {
        console.error("marketo.js - updateIncentive - try/catch")
        console.error(e)
        resolve(false)
      }
    })
  }
}
