const axios = require("axios")
const cheerio = require("cheerio")
const express = require("express")
const app = express()
app.listen(process.env.port || 3000)


function dateToEpoch(date) {
    date = new Date(date).getTime()  /  1000
    return date
}

function getBlog(section) {
    // Section can be "featured" or "all" or "nonfeatured"
    return new Promise((resolve, reject) => {
        axios({
            method: "get",
            url: "https://www.cache4itsolutions.co.uk/blog?start=20"
        })
        .then(resp => {
            const $ = cheerio.load(resp.data)
            let BASE_URL = `https://www.cache4itsolutions.co.uk`
            let HTTPS_BASE = `https:`
            var finalData = {
                featured: [],
                last20blogs: []
            }
    
            // Featured posts
            $("div[class~='swiper-slide']").each((index, element) => {
                let title = $(element).find(".eb-card__title").text().trim()
                let categories = $(element).find(".eb-post-category").text().trim().split("   ") || []
                let dateText = $(element).find("time[class='eb-meta-date']").text().trim()
                let dateEpoch = dateToEpoch($(element).find("time[class='eb-meta-date']").attr('content'))
                let contentPreview = $(element).find(".eb-card__bd-content").text().trim()
                let continueReading = BASE_URL + $(element).find("a[class~='btn']").attr("href")
                let author = $(element).find(".eb-avatar > img").attr("alt") || null
                let image = HTTPS_BASE + $(element).find(".embed-responsive-item").css("background-image").replace(/url\('([^ъ]+)'\)/gm, "$1") || null
                let id = index
    
                let obj = {
                    title,
                    categories,
                    date: {
                        dateText,
                        dateEpoch
                    },
                    contentPreview,
                    continueReading,
                    author,
                    image,
                    id
                }
    
                finalData.featured.push(obj)
            })
    
            // Normal blog list
            $("div[class~='eb-cards__item']").each((index, element) => {
                let title = $(element).find(".eb-card__title").text().trim()
                let featured = $(element).find(".eb-post-featured > i").length ? true  : false
                let hits = parseInt($(element).find("div[class~='eb-post-hits']").text().trim().replace(" Hits", ""))
                let comments = parseInt($(element).find(".eb-post-comments").text().trim().replace(" Comments", ""))
                let dateText = $(element).find("time[class='eb-meta-date']").text().trim()
                let dateEpoch = dateToEpoch($(element).find("time[class='eb-meta-date']").attr('content'))
                let contentPreview = $(element).find(".eb-card__bd-content").text().trim()
                let continueReading = BASE_URL + $(element).find("a[class~='btn']").attr("href")
                let author = $(element).find(".eb-avatar > img").attr("alt") || null
                let categories = $(element).find(".eb-post-category").text().trim().split("   ") || []
                let image = HTTPS_BASE + $(element).find(".embed-responsive-item").css("background-image").replace(/url\('([^ъ]+)'\)/gm, "$1") || null
                let id = index
                
                let obj = {
                    title,
                    featured,
                    author,
                    categories,
                    image,
                    hits,
                    comments,
                    date: {
                        dateText,
                        dateEpoch
                    },
                    contentPreview,
                    continueReading,
                    id
                }
    
                finalData.last20blogs.push(obj)
            })
            
            switch(section) {
                case "all":
                    resolve(finalData)
                    break;
                case "featured":
                    resolve(finalData.featured)
                    break;
                case "nonfeatured":
                    resolve(finalData.last20blogs)
                    break;
                default:
                    resolve(finalData)
                    break;
            }
    
        })
        .catch(err => {
            let ERROR_REASON_ENUM = {
                404: "Not found",
                403: "You do not have access to this resource",
                429: "Rate-limited",
                400: "Malformed request"
            }
            reject({
                "error": true,
                "reason": ERROR_REASON_ENUM[err.response.status]
            })
        })
    })

}

app.get("/", (req, resp) => {
    getBlog("all")
        .then(jsonResp => resp.json(jsonResp))
        .catch(jsonErr => resp.json(jsonErr))
})

app.get("/featured", (req, resp) => {
    getBlog("featured")
        .then(jsonResp => resp.json(jsonResp))
        .catch(jsonErr => resp.json(jsonErr))
})

app.get("/all", (req, resp) => {
    getBlog("all")
        .then(jsonResp => resp.json(jsonResp))
        .catch(jsonErr => resp.json(jsonErr))
})

app.get("/nonfeatured", (req, resp) => {
    getBlog("nonfeatured")
        .then(jsonResp => resp.json(jsonResp))
        .catch(jsonErr => resp.json(jsonErr))
})


setTimeout(() => {

}, 1000000)