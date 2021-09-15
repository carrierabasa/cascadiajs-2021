
let md = require('marked')
let Layout = require('./layout')
let SocialLayout = require('./layout/social')
let assetPath = 'https://create-4jr.begin.app/_static/2021'
//let baseUrl = require('@architect/shared/utils/base-url')()

let Template = function(speaker) {
    const { key, name, location, company, url, twitter, title, topics, pronouns, abstract, resources, ytId } = speaker

    return /*html*/`
    <div id="page">
        <div class="page-title">
            <div>
                <h1>${ name }</h1>
            </div>
        </div>
        <div class="page-body">
            <!--div class="cta"><a href="http://eepurl.com/dPmCkT">Sign-Up for Updates on CascadiaJS 2022</a></div-->
            <section class="person">
                <h2>${ title }</h2>
                <!--div class="video">
                    ${ ytId ?
                        /*html*/`<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${ ytId }" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
                    : /*html*/`<p>Video Recording Coming Soon!</p>`}
                </div-->
                <div class="topics">${ topics.map(t => `<div class=js-topic>${ t }</div>`).join('') }</div>
                <div class="abstract">${ md(abstract) }</div>
                <!--div class="illustration">
                    <img src="/images/speakers/${ key }-illustration.png" alt="talk illustration"/><br/>
                    <p><small><i>Illustrations made posible by our friends at <a href="https://circleci.com/signup">CircleCI</a> ❤️</i></small></p>
                </div-->
                <!--div class="resources">
                    ${ resources ?
                        /*html*/`<h3>Talk Resources</h3><ul>${resources.map(r =>
                            /*html*/`<li><a href="${ r.url }">${ r.title }</a></li>`).join("")}</ul>`
                    : `` }
                </div-->
                <h2>About ${ name }</h2>
                <div class="person-info"> 
                    <div class="person-photo"><img src="${ assetPath }/${ key }.jpg" alt="photo of ${ name }"/></div>
                    <div class="person-more">
                        ${ pronouns ? `<h3>Pronouns</h3><p>${ pronouns }</p>` : '' }
                        <h3>Location</h3>
                        <p>${ location }</p>
                        <h3>Company</h3>
                        <p>${ company }</p>
                        <h3>Links</h3>
                        <div class="person-links">
                        ${ twitter ? `<div><i class="fab fa-twitter"></i> <a href="https://twitter.com/${ twitter }">@${ twitter }</a></div>` : '' }
                        ${ url ? `<div><i class="fa fa-globe"></i> <a href="${ url }">${ url.split("://")[1] }</a></div>` : '' }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
`
}

module.exports = async function Speaker({speaker, social}) {
    let html
    if (social !== undefined) {
        const { key, name: header, title: excerpt } = speaker
        const image = `${ assetPath }/${ key }.jpg`
        html = SocialLayout({ image, header, excerpt })
    }
    else {
        let content = Template(speaker)
        let socialUrl = `/speakers/${ speaker.key }`
        //let socialUrl = `${ baseUrl }/images/speakers/${ speaker.key }-illustration.jpg`
        let title = `${ speaker.name } | ${ speaker.title }`
        html = Layout({ content, title, socialUrl })
    }

    return { html }
}
