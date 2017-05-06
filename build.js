var fs = require('fs');
var path = require('path');
var markpress = require('markpress');

var options = {
  layout: 'horizontal',

  autoSplit: false,
  silent: false,
  sanitize: false
}

module.exports = markpress(path.join(process.cwd(), 'slides.md'), options)
  .then(function(content) {
    if(!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }
    fs.writeFileSync('dist/index.html', content);

    console.log('Slides built');
  })
  .catch(function(e) {
    console.log(e);
  });
