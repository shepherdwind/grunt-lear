var htmlparser = require("htmlparser2")
var util = require("util")

var selfCloseTags = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

function parse(str, customTags){

  customTags = customTags || []

  var parts = []
  var result = ''
  var selectParts = [];

  var parser = new htmlparser.Parser({

    onopentag: function(name, attribs){

      result += '<' + name;
      var attrstr = Object.keys(attribs).map(function(key){
        return util.format('%s="%s"', key, attribs[key])
      }).join(' ')

      if (attrstr.length > 0) attrstr = ' ' + attrstr

      result += attrstr + '>'

      if (customTags.indexOf(name) > -1 || attribs['data-path']) {
        parts.push(result + util.format('{{@with %s}}', name))
        result = ''
        var requirePath = attribs['data-path'] || '../' + name + '/index'
        parts.push({ require: util.format('"%s"', requirePath) })
        selectParts.push(name)
      }

    },
    ontext: function(text){
      result += text
    },
    onclosetag: function(tagname){
      if (selfCloseTags.indexOf(tagname) === -1) {
        if (selectParts.indexOf(tagname) > -1) {
          result += util.format('{{/with}}</%s>', tagname)
        } else {
          result += '</' + tagname + '>'
        }
      }
    }
  })

  parser.write(str)
  parser.end()
  parts.push(result)

  return parts

}
//var a = parse("xx<custom-tag data-path=\"./mod2/\"></custom-tag> hello")
//console.log(a)
exports.parse = parse
