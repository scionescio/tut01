const fs = require('fs')
const util = require('util')
var DomParser = require('dom-parser');
var parser = new DomParser();
var path = '.'

const readdir = util.promisify(fs.readdir)
const evaluate = require('./evaluate.js')


function checkImage(content) {
  var dom = parser.parseFromString(content);
  var points = 0

  var title = dom.getElementsByTagName("h1")[0]
  if (typeof(title) != "undefined") {
    var images = dom.getElementsByTagName("img")

    for (var i = 0; i < images.length; i++) {

      for (var j = 0; j < images[i].attributes.length; j++) {
        if (images[i].attributes[j].name == "alt" && images[i].attributes[j].value == title.innerHTML) {
          points = points + 50;
        }
      }
    }
  }
  return Math.min(points, 200);

}

function seo(nr) {
  nr = parseInt(nr)
  nr % 2 == 0 ? pnr = nr - 1 : pnr = nr + 1
  ownfile = '.' + path + '/' + nr + '/index.html'
  pfile = path + '/' + pnr + '/index.html'
  pcontent = fs.readFileSync(pfile, 'utf8')
  var dom = parser.parseFromString(pcontent)

  var link = dom.getElementById("link")

  if (link != null) {
    if (link.innerHTML == ownfile) {
      return 100
    }
  }

  return 0
}


readdir(path)
    .then((files) => {
      return files.filter(file => fs.statSync(path + '/' + file).isDirectory() && file != ".idea" && file != "node_modules" && file != ".git" == true)
    })
    .then(files => {
      return files.map(file => [fs.readFileSync(path + '/' + file + '/index.html', 'utf8'), file])
    })
    .then(contents => {
      return contents.map(content => [content[1], evaluate.checkHTML(content[0]) + checkImage(content[0]) + seo(content[1])])
    })
    .then(results => {

      results.forEach(result => console.log(`Gruppe: ${result[0]} hat Punkte: ${result[1]}`))
    })
    .catch(error => console.log(error));




