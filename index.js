// Example use of simplecrawler, courtesy of @breck7! Thanks mate. :)

/**
 * @param String. Domain to download.
 * @Param Function. Callback when crawl is complete.
 */
var downloadSite = function(domain, callback) {
    var fs = require("node-fs"),
        url = require("url"),
        path = require("path"),
        cheerio = require("cheerio"),
        Crawler = require("simplecrawler").Crawler;

    var processFile = function(filepath){
        
        fs.readFile(filepath, function (err, data) {
            if (err) throw err;
                
               var $ = cheerio.load(data);
               
               var title = $('title').text();
               
               if (title === ""){
                   console.error(filepath + ":No Title");
               }

               if (title.length < 70){
                   console.error(filepath + ":Short Title: " + title);
               }
               
               if (title.length > 70){
                   console.error(filepath + ":long Title: " + title);
               }

               var h1 = $('h1').text();
               
               if (h1 === ""){
                   console.error(filepath + ":No h1");
               }
               
               var h2 = $('h2').text();
               
               if (h2 === ""){
                   console.error(filepath + ":No h2");
               }
               
               var h3 = $('h3').text();
               
               if (h3 === ""){
                   console.error(filepath + ":No h3");
               }
               
               var altTags = $('img[alt=""]');
               
               if (altTags.length > 0){
                   console.error(filepath + " " + altTags.length + " missing alt tags");
               }
               
            });    
    };

    var myCrawler = new Crawler(domain);
    myCrawler.interval = 250;
    myCrawler.maxConcurrency = 5;

    myCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {

        console.log(queueItem.stateData.code);
        console.log(queueItem.stateData.requestTime);

        // Parse url
        var parsed = url.parse(queueItem.url);

        // Rename / to index.html
        if (parsed.pathname === "/") {
            parsed.pathname = "/index";
        }

        // Where to save downloaded data
        var outputDirectory = path.join(__dirname, domain);

        // Get directory name in order to create any nested dirs
        var dirname = outputDirectory + parsed.pathname.replace(/\/[^\/]+$/, "");

        // Path to save file
        var filepath = outputDirectory + parsed.pathname + ".html";

        // Check if DIR exists
        fs.exists(dirname, function(exists) {

            // If DIR exists, write file
            if (exists) {
                fs.writeFile(filepath, responseBuffer, function() {
                    processFile(filepath)
                });
            } else {
                // Else, recursively create dir using node-fs, then write file
                fs.mkdir(dirname, 0755, true, function() {
                    fs.writeFile(filepath, responseBuffer, function() {
                        processFile(filepath)
                    });
                });
            }

        });

        console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
        console.log("It was a resource of type %s", response.headers["content-type"]);
    });
    
    myCrawler.addFetchCondition(function(parsedURL) {
        return !parsedURL.path.match(/\.(png|jpg|jpeg|gif|ico|css|js|csv|doc|docx|pdf)$/i);
    });

    // Fire callback
    myCrawler.on("complete", function() {
        callback();
    });

    // Start Crawl
    myCrawler.start();

};




downloadSite("personal.aib.ie", function() {
    console.log("Done!");
});