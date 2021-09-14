// eslint-disable-next-line no-global-assign
require = require('esm')(module)
let exists = require('fs').existsSync
let join = require('path').join
let arc = require('@architect/functions')
let IndexView = require('@architect/views/index')
let PageView = require('@architect/views/pages')
let NotFoundView = require('@architect/views/404')
let manifest = require('@architect/shared/static.json')
let getChangelog = require('@architect/shared/changelog')
let getDirectoryData = require('@architect/shared/get-directory-data')
let getSpeakerData = require('@architect/shared/get-speaker-data')

// return true if the markdown file exists, false otherwise
function pageExists(path) {
  let page = path.substr(1)
  let md = join(process.cwd(), 'node_modules', '@architect', 'views', 'content', `${ page }.md`)
  let html = join(process.cwd(), 'node_modules', '@architect', 'views', 'content', `${ page }.html`)
  return exists(md) || exists(html)
}

// return truthy if the asset requested is in our static manifest JSON, falsy otherwise
function staticExists(path) {
  let asset = path.substr(1)
  return manifest[asset]
}

/**
 * This router passes the request to the appropriate view or static asset
 */
async function Router (req) {
  // root (/) request, return Index view
  if (req.path === '/') {
      let all = getChangelog()
      // only pass the most recent 3 posts
      let changelog = all.slice(0, 3)
      let directory = await getDirectoryData()
      let { speakers } = await getSpeakerData(req)
      return await IndexView({ changelog, speakers, directory })
  }
  // the path matches a markdown file in our filesystem
  else if (pageExists(req.path)) {
    return await PageView(req)
  }
  // the path matches a static file we know about
  else if (staticExists(req.path)) {
    return {
      statusCode: 301,
      headers: {
        location: arc.static(req.path)
      }
    }
  }
  else return
}

exports.handler = arc.http.async(Router, NotFoundView)