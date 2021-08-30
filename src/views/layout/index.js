let head = require('./head')
let footer = require('./footer')
let bodyScripts = require('./scripts')

module.exports = function Layout ({title, content, socialUrl, excerpt, scripts = []}) {
  return /*html*/`
  <!doctype html>
  <html lang=en>
    ${ head({ title, content, socialUrl, excerpt })}
    <body>
      <div id="root">
        <header>
          <!--section class="alert">
            See you in 2021!
          </section-->
          <nav>
            <div class="wide">
              <div id="logo"><a href="/"><img src="/images/logo-green.svg" alt="logo"/></a></div>
              <div><span><a href="/">CascadiaJS / Nov 3-4, 2021</a></span></div>
              <div class="push"><a href="/workshops">Workshops</a></div>
              <div class="spacer"><a href="/code-of-conduct">Code of Conduct</a></div>
              <div class="spacer"><a href="/tickets" class="buy">Tickets</a></div>
            </div>
          </nav>
        </header>
        <main id="content">
          ${ content }
        </main>
        ${ footer() }
      </div>
      ${ bodyScripts({ scripts })}
    </body>
  </html>
`
}
