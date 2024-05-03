const express = require("express")
const app = express()

const axios = require("axios")
const cheerio = require("cheerio")

const url = "https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap"
const urlStart= "https://es.wikipedia.org"


app.get("/", (req, res)=>{
    axios.get(url)
    .then((response)=>{
        if(response.status === 200){
            const html = response.data
            
            const $ = cheerio.load(html)
            
            const pageTitle= $("title").text() //Sacamos el título de la página
            
            const links = []
            const array = []
            
            $('#mw-pages a').each((index, element) =>{
                const link = $(element).attr("href") //Iteramos sobre los elementos a y recogemos su atributo href
                links.push(urlStart+link)
            })

            const linkProm = links.map(link => {
                const newUrl = link
                return axios.get(newUrl).then((response)=>{
                    if(response.status === 200){
                        const html = response.data
            
                        const $ = cheerio.load(html)
            
                        const pageTitleFinal = $("title").text().replace(" - Wikipedia, la enciclopedia libre", "")
                        const imgsFinal = []
                        const textFinal = []

                        $(".imagen img").each((index, element)=>{
                            const img = $(element).attr("src") //Con esto recogemos el atributo src de cada imagen.
                            imgsFinal.push(img)
                        })

                        $(".mw-content-ltr > p").each((index, element)=>{
                            const p = $(element).text().split('"').join('').split("'").join('') //Quita comillas
                            textFinal.push(p);
                        })


                        const obj = {
                            "title": pageTitleFinal,
                            "images": imgsFinal,
                            "paragraphs": [textFinal]
                        }
                        array.push(obj)
                        //console.log(array)
            
                    }
                })

            })
            //console.log(array)

            Promise.all(linkProm).then(() => {
                console.log(array);
                res.send(`
                    <h1>${pageTitle}</h1>
                    <h2>Enlaces</h2>
                    <ul>
                        ${links.map(link => `<li><a href="${link}">${link}</a></li>`).join("")}
                    </ul>
                    <div>${array.map(object => `<h3>${object.title}</h3> <img src="${object.images}"> ${object.paragraphs.map(obj => `<p>${obj}</p>`)}`).join("")}</div>
                `);
            })

        }
    })
})


app.listen(3000, ()=>{
    console.log("Express está escucando en el puerto http://localhost:3000")
})