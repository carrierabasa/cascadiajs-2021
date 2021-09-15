function script(source) {
  return `<script src=${source} type=module crossorigin></script>`
}

function getBaseUrl() {
  let url
  if (process.env.NODE_ENV === 'testing') {
      url = 'http://localhost:3333'
  }
  else  {
      url = `https://${ process.env.NODE_ENV === 'staging' ? 'staging.' : '' }2021.cascadiajs.com`
  }
  return url
}

module.exports = function Head ({title, socialUrl = 'https://2021.cascadiajs.com/images/social/conf-share.png', excerpt = null, scripts = []}) {
  // expand title
  title = `CascadiaJS 2021${ title ? ' - ' + title : '' }`

  // convert relative a socialURL to absolute, if necessary
  if (socialUrl.startsWith("/")) {
    socialUrl = getBaseUrl() + socialUrl
  }

  return /*html*/`
  <head>
    <meta charset=utf-8>
    <title>${ title }</title>
    <link rel="stylesheet" href="https://use.typekit.net/emp6mcu.css">
    <link rel="stylesheet" href="/styles/normalize.css">
    <link rel="stylesheet" href="/styles/main.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${ excerpt ? `<meta property="og:description" content="${ excerpt }" />` : ``}
    <meta property="og:image" content="${ socialUrl }" />
    <meta name="twitter:image" content="${ socialUrl }">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@cascadiajs">
    <meta name="twitter:title" content="${ title }">
    <link id="light-scheme-icon" rel="icon" href="/images/logo-blue.svg">
    <link id="dark-scheme-icon" rel="icon" href="/images/logo-green.svg">
    <!--script id="mcjs">!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/ffa37cf28eebc9e75b8558f3b/925e6ccb935f17081158752ba.js");</script-->
    <!--script src="/js/floating.js"></script-->
    ${ scripts.map(s => script(s)) }
  </head>
`
}
