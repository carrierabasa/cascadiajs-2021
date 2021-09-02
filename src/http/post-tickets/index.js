let arc = require('@architect/functions')
let data = require('@begin/data')

exports.handler = arc.http.async(auth, upload)

/** ensure session */
async function auth(req) {
  if (!req.session.loggedIn)
    return { location: '/' }
}

/** write to begin/data */
async function upload(req) {
  let tickets = req.body

  // break-up our list of codes into groups of 25 (Begin data limit on batch sets)
  let size = 25
  var grouped = []
  for(var i = 0; i < tickets.length; i += size) {
    grouped.push(
      tickets.slice(i, i+size).map(t => ({
        table: 'tickets',
        ...t
      }))
    )
  }

  console.log(grouped)

  for (let group of grouped) {
    await data.set(group)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({success: true})
  }
}
