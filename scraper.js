const fetch = require('node-fetch')
const cheerio = require('cheerio')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const url = 'https://www.imdb.com/find?ref_=nv_sr_fn&s=all&q='
const url1 = 'https://www.imdb.com/title/'

function searchMovies(searchTerm)
{
    const movies = []
    return fetch(`${url}${searchTerm}`)
    .then(Response => Response.text())
    .then(body => {
        const $ = cheerio.load(body)
        $('.findResult').each(function(i,element) {
            const $element = $(element)
            const $image = $element.find('td a img')
            const $title = $element.find('td.result_text a')
            var imdbID = $title.attr('href').match(/title\/(.*)\//)
            if(imdbID != null && imdbID.length > 1)
            {
                imdbID = imdbID[1]
            }
            const movie = {
                image : $image.attr('src'),
                title : $title.text(),
                imdbID
            }
            movies.push(movie)
        })
        return movies
    }).catch()
}

function getMovie(searchTerm)
{
    return fetch(`${url1}${searchTerm}`)
    .then(Response => Response.text())
    .then(body => {
        const $ = cheerio.load(body)
        const $title = $('.title_wrapper h1')
        
        const title = $title.first().contents().filter(function(){
            return this.type == 'text'
        }).text().trim()
        const rating = $('.subtext').contents().text().trim().split("|")[0].split(" ")[0].split("\n")[0]
        const runTime = $('.subtext time').text().trim()
        const genres = [];
        const imdbRating = $('span[itemProp="ratingValue"]').text()
        $('.subtext a').each(function(i,element) {
            const genre = $(element).text().trim();
            genres.push(genre)
        })
        const movieposter = $('div.poster a img').attr('src')
        const datePublished = genres.pop()
        const summary = $('div.summary_text').text().trim()
        const director = $('div.credit_summary_item a').contents().first().text()
        return {
            title,
            rating,
            runTime,
            genres,
            datePublished,
            imdbRating,
            movieposter,
            summary,
            director
        }
    })
}

module.exports = {
    searchMovies,getMovie
}