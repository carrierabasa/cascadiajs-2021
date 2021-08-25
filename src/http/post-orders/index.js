let arc = require('@architect/functions')
let parseBody = arc.http.helpers.bodyParser
let data = require('@begin/data')
let crypto = require("crypto")

let releaseSlugsForHoodies = ["wmg4ibcq-zk", "uvup7alttr8", "du8rpnvpqeg", "jmdds5wxi4y", "7j-cyjllimi", "h-ksr70mfng"]
let releaseSlugsForConference = releaseSlugsForHoodies.concat(["6clpkijtmie", "ubizzb4yh9w"])

exports.handler = async function(req) {
  // authenticate the token passed in the header
  let titoSig = req.headers['Tito-Signature'] || req.headers['tito-signature']
  //console.log(titoSig)
  let decoded = Buffer.from(req.body, 'base64').toString()
  //console.log(decoded)
  let hash = crypto.createHmac("sha256", process.env.TITO_WEBHOOK_KEY).update(decoded).digest("base64")
  // the hash of the POST body and the value of tito sig don't match, this is a bad request
  if (hash !== titoSig) {
    console.log('ERROR!!! the Tito sig and the calculated hash value did not match ', titoSig, hash)
    return {
      statusCode: 401,
      body: JSON.stringify({message: "not authorized"})
    }
  }
  // else, let's process the webhook!
  else {
    let action = req.headers['x-webhook-name'] || req.headers['X-Webhook-Name']
    // payment for the ticket has occurred
    if (action === 'registration.finished') {
      //console.log('processing registration.finished webhook')
      return registrationFinished(req)
    }
    // update the full name associated with ticket(s)
    else if (action === 'ticket.completed' || action === 'ticket.updated') {
      //console.log('processing ticket.completed or ticket.updated webhook')
      return ticketCompletedOrUpdated(req)
    }
    // delete voided tickets
    else if (action === 'ticket.voided') {
      //console.log('processing ticket.voided webhook')
      return ticketVoided(req)
    }
    else {
      console.log('unsupported webhook')
      console.log(parseBody(req))
      return {
        statusCode: 400,
        body: JSON.stringify({message: "unsupported webhook"})
      }
    }
  }
}

async function registrationFinished(req) {
  let titoOrder = parseBody(req)
  // write ticket data to the DB and see if any tickets includes a hoodie
  let hoodieTickets = []
  for (let ticket of titoOrder.tickets) {
    // write ticket into DB
    let conference = releaseSlugsForConference.includes(ticket.release_slug) ? 'Y' : 'N'
    let ticketDoc = await data.set({ table: 'tickets', key: ticket.reference, ticket: ticket.release_title, conference })
    if (releaseSlugsForHoodies.includes(ticket.release_slug)) {
      hoodieTickets.push(ticketDoc)
    }
  }
  //console.log('tickets that include a free hoodie', hoodieTickets)

  // if so find a redemption code that is free, and assign it to this ticket id
  if (hoodieTickets.length > 0) {
    let codes = await data.get({table: 'codes', limit: 1000})
    let freeCodes = codes.filter(c => c.ticketRef === undefined)
    //console.log('Number of free codes available: ', freeCodes.length)
    // loop through each ticket that qualifies for a hoodie
    for (let i in hoodieTickets) {
      let ticket = hoodieTickets[i]
      let free = freeCodes[i]
      if (free) {
        //console.log('Assigning code to ticket ref', free.key, ticket.key)
        // update the codes table to mark this code as used
        await data.set({...free, ticketRef: ticket.key})
        // update the tickets table to reference the assigned code
        await data.set({ ...ticket, code: free.key, hoodie: 'Y' })
      }
      else {
        // FUCK
        console.log('We have run out of available codes!!!')
      }
    }
  }
  else {
    //console.log(`No hoodies associated with tickets for order ${ titoOrder.reference }`)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({success: true})
  }
}

async function ticketCompletedOrUpdated(req) {
  let titoTicket = parseBody(req)
  let key = titoTicket.reference
  let fullName = titoTicket.name
  // update the name associated with this ticket
  let doc = await data.get({ table: 'tickets', key })
  await data.set({ ...doc, fullName })
  return {
    statusCode: 200,
    body: JSON.stringify({success: true})
  }
}

async function ticketVoided(req) {
  let titoTicket = parseBody(req)
  let key = titoTicket.reference
  // delete the ticket
  await data.destroy({ table: 'tickets', key })
  // see if a redemption code was assigned to this ticket
  let codes = await data.get({table: 'codes', limit: 1000})
  let code = codes.find(c => c.ticketRef === key)
  if (code) {
    // free up the redemption code
    delete code.ticketRef
    await data.set(code)
  }
  return {
    statusCode: 200,
    body: JSON.stringify({success: true})
  }
}