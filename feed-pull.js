const https = require("https")
const parseString = require("xml2js").parseString
const mongoose = require("mongoose")
const Publication = require("./server/models/publication")
const config = require("config")
const hash = require("object-hash")
const cron = require("node-cron")

mongoose.Promise = global.Promise
let lastCheck // holds previous RSS feed, used to only run if different

// removes html tags from text
const cleanUpContent = text => {
  let plaintext = text.replace(/<\/?[^>]+(>|$)/g, " ")
  plaintext = plaintext.replace(/\s\s+/g, " ")
  return plaintext
}

// pulls the unique ID for the publication from the medium url
const getUrlId = item => {
  let id = item.guid[0]["_"]
  id = id.substring(id.lastIndexOf("/") + 1)
  return id
}

// handles all the data setting of the publication
const createUpdatePublication = (publication, rssItem) => {
  return new Promise((resolve, reject) => {
    publication.title = rssItem.title[0]
    publication.author = rssItem["dc:creator"][0]
    publication.link = rssItem["link"][0]
    publication.tags = rssItem.category.join(", ")
    publication.checksum = hash(rssItem)
    publication.published = new Date(rssItem.pubDate[0])
    publication.published_num = publication.published.getTime()
    publication.content = rssItem["content:encoded"][0]
    publication.mediumId = getUrlId(rssItem)
    publication.plaintext = cleanUpContent(publication.content)
    publication.short_description =
      publication.plaintext.length > 200
        ? `${publication.plaintext.substring(0, 197)}...`
        : publication.plaintext
    publication.image =
      getFirstImage(publication.content) ||
      "/attachments/default/publication.png"
    publication.approved = true
    publication.save().then(result => {
      resolve()
    })
  })
}

// retrieves the first image in the content, or null if none exists
const getFirstImage = content => {
  let index = content.indexOf("<img")
  if (index >= 0) {
    index = content.indexOf('src="', index)
    if (index >= 0) {
      index += 5
      let lastIndex = content.indexOf('"', index)
      let image = content.substring(index, lastIndex)
      if (image.indexOf("stat?event=post.clientViewed") >= 0) {
        // this is an image medium puts into rss feeds, don't want to use this
        return null
      }
      return image
    } else {
      return null
    }
  } else {
    return null
  }
}

console.log("Checking for new publications")

https
  .get(`https://medium.com/feed/${config.mediumId}`, res => {
    const statusCode = res.statusCode
    const contentType = res.headers["content-type"]

    let error
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
    } else if (!/^text\/xml/.test(contentType)) {
      error = new Error(
        `Invalid content-type.\n` +
          `Expected application/json but received ${contentType}`
      )
    }
    if (error) {
      console.error(error.message)
      // consume response data to free up memory
      res.resume()
      return
    }

    res.setEncoding("utf8")
    let rawData = ""
    res.on("data", chunk => (rawData += chunk))
    res.on("end", () => {
      try {
        let rdHash = hash(rawData)
        if (lastCheck === rdHash) {
          console.log("No change, No worries")
        } else {
          console.log("There's a change")
          lastCheck = rdHash
          parseString(rawData, (err, result) => {
            if (err) {
              console.error("Issue parsing xml", err)
            } else {
              mongoose
                .connect(config.mongoconnectionstring)
                .then(connection => {
                  console.log(
                    `${result.rss.channel[0].item.length} publications`
                  )
                  Promise.all(
                    result.rss.channel[0].item.map(item => {
                      return new Promise((resolve, reject) => {
                        Publication.findOne({ mediumId: getUrlId(item) })
                          .then(publication => {
                            if (publication) {
                              const itemHash = hash(item)
                              if (itemHash !== publication.checksum) {
                                console.log(
                                  `Publication Updated: ${item.title[0]}`
                                )
                                // item has changed
                                return createUpdatePublication(
                                  publication,
                                  item
                                )
                              } else {
                                resolve()
                              }
                            } else {
                              console.log(`New Publication: ${item.title[0]}`)
                              // item doesn't exist yet
                              const newPublication = new Publication({
                                mediumId: getUrlId(item)
                              })
                              return createUpdatePublication(
                                newPublication,
                                item
                              )
                            }
                          })
                          .then(created => resolve())
                      })
                    })
                  ).then(result => {
                    console.log("done")
                    mongoose.connection.close()
                  }) // Promise.all.then
                }) // mongoose.connect
            } // if (err)
          }) // parseString
        } // if (lastCheck === rawData)
      } catch (e) {
        console.error(`Generic Catch: ${e.message}`)
      }
    })
  })
  .on("error", e => {
    console.error(`Got error: ${e.message}`)
  })
