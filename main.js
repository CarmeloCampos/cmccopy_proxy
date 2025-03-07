var request = require("request");
var cheerio = require("cheerio");

const ProjectName="copy MarketCap";

var express = require('express');
var app = express();


var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['css', 'json', 'js', 'ico', 'png'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}
app.use(express.static(__dirname + '/public', options));


async function removeElements($){
  $(".cmc-newsletter-signup").remove()
  //$("script").remove();
  $("[id*='ad']").remove()
  return $;
}

async function reemplaceElements($){
  var replace_str = $('body').html().replace(/CoinMarketCap/g,ProjectName);
  $('body').html(replace_str);


  //reemplace elements in js



  return $
}


app.get('/', function (req, res) {
  request({
    uri: "https://coinmarketcap.com/",
  }, async function(error, response, body) {
    var $ = cheerio.load(body);

    $=await removeElements($);
    $=await reemplaceElements($);




    await $("script[src]").each(function() {
      var src = $(this);
      var text = src.attr("src");

      var re = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(base+\.).+(js)/,'g'); // notacion literal
      var re2 = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(basehead+\.).+(js)/,'g'); // notacion literal
      var re3 = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(currencies_main+\.).+(js)/,'g'); // notacion literal
      var re4 = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(prebid+\.).+(js)/,'g'); // notacion literal
      var re5 = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(currencies_top+\.).+(js)/,'g'); // notacion literal
      if(text.match(re)!=null){
        src.attr("src", "base.js");
        src.attr("notremove", "true");
      }

      if (text.match(re2)!=null) {
        src.attr("src", "basehead.js");
        src.attr("notremove", "true");
      }

      if (text.match(re3)!=null) {
        src.attr("src", "currencies_main.js");
        src.attr("notremove", "true");
      }

      if (text.match(re4)!=null) {
        src.attr("src", "prebid.js");
        src.attr("notremove", "true");
      }

      if (text.match(re5)!=null) {
        src.attr("src", "currencies_top.js");
        src.attr("notremove", "true");
      }
      //src.attr("src", "https://coinmarketcap.com/"+text);
    });

    await $("link[href]").each(function() {
      var src = $(this);
      var url = src.attr("href");

      var re = new RegExp(/(https:\/\/s2\.coinmarketcap\.com\/static\/cloud\/compressed\/)+(base).*?.(css)/,'g'); // notacion literal
      if(url.match(re)!=null){
        src.attr("href", "main.css");
      }

    });

    //$("script[notremove!=true]").remove()
    $("body").prepend($("<script>").attr("src", "inyect.js"))


    res.send($.html());
  });

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
