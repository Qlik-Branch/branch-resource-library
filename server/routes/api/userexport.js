const UserProfile = require('../../models/userprofile'),
Error = require("../../controllers/error")

let getDate = dateString => {
  if (dateString) {
    let theDate = new Date(dateString)
    return `${theDate.getFullYear().toString()}-${(theDate.getMonth() + 1
    ).toString()}-${theDate.getDate()}`
  } else {
    return ''
  }
}

let outputProfile = (profile, stream) => {
  let line = [
    profile.email,
    profile.fullname,
    profile.username,
    profile.company,
    profile.bio,
    profile.title,
    profile.city,
    profile.state,
    profile.country,
    profile.github_user,
    profile.branch_firstaccess, // bool
    profile.playground_firstaccess, // bool
    profile.facebook,
    profile.twitter,
    profile.website,
    getDate(profile.createdate), // date
    getDate(profile.lastvisit), // date
    profile.unsubscribed,
    profile.ted
  ]
  stream.write(`"${line.join('","')}"\r\n`)
}

let headers = [
  'email',
  'fullname',
  'username',
  'company',
  'bio',
  'title',
  'city',
  'state',
  'country',
  'github_user',
  'branch_firstaccess', // bool
  'playground_firstaccess', // bool
  'facebook',
  'twitter',
  'website',
  'createdate', // date
  'lastvisit', // date
  'opted_out',
  'ted'
]

function GetCsv(stream, params) {
  stream.setHeader('Content-disposition', 'attachment; filename=user-list.csv');
  stream.setHeader('Content-type', 'text/csv');
  stream.write(`"${headers.join('","')}"\r\n`)
  let query = { }
  if(params.year) {
    query["$and"] = []
    let startDate = new Date(params.year, 0, 1)
    let endDate = new Date(params.year, 0, 1)
    endDate.setFullYear(endDate.getFullYear()+1)
    query["$and"].push({ createdate: { $gte: startDate } })
    query["$and"].push({ createdate: { $lt: endDate}})
  }
  UserProfile.find(query)
  .then((profiles) => {
    profiles.forEach(profile => outputProfile(profile, stream))
    stream.end()
  })
}

module.exports = (req, res) => {
  if(req.user && req.user.role && req.user.role.name==="admin") {
    GetCsv(res, req.params)
  } else {
    res.json(Error.insufficientPermissions());
  }
}