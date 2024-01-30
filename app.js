// Requiring module
const express = require('express');

// Axios module
const axios = require('axios');

// Parser module
const xml2js = require('xml2js');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;



// Creating express object
const app = express();

// Handling GET request
app.get('/', (req, res) => { 
	res.send('A simple Node App is '
		+ 'running on this server') 
	res.end() 
})

// Handling GET query scrape
app.get('/scrape/:query', async (req, res) => { 
    const {query} = req.params;
    console.log(query);
    // run scrapping script
    // return response
    let response = await scrape(query);
    res.send(response);
})



// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));


async function scrape(query){
    let url = `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`
    let response = await axios.get(url);
    let content = response.data;

    // Convert xml2js.parseString to return a Promise
    let result = await new Promise((resolve, reject) => {
        xml2js.parseString(content, function (err, result){
            if (err) reject(err);
            else resolve(result);
        });
    });

    let items = result.rss.channel[0].item;
    for(let i = 0; i < 10; i++) {
        let item = items[i];
        let title = item.title[0];
        let pubDate = item.pubDate[0];
        // Change pubDate to sgt
        let date = new Date(pubDate);
        let sgtDate = new Date(date.getTime() + 8*60*60*1000); // SGT => UTC+8
        pubDate = sgtDate.toISOString();

        
        // Parse the HTML in the description to extract the text
        let dom = new JSDOM(item.description[0]);
        let description = dom.window.document.querySelector('a').textContent;

        let link = item.link[0];
        let obj = {
            title,
            description,
            link,
            pubDate
        }
        console.log(obj);
    }

    // Now you can return items or use it elsewhere in your code
    return items;
}