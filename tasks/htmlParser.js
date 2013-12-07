var htmlparser = require("htmlparser2")
var util = require("util")

function parse(str, customTags){

  customTags = customTags || []

  var parts = []
  var result = ''
  var parser = new htmlparser.Parser({

    onopentag: function(name, attribs){

      result += '<' + name;
      var attrstr = Object.keys(attribs).map(function(key){
        return util.format('%s="%s"', key, attribs[key])
      }).join(' ')

      if (attrstr.length > 0) attrstr = ' ' + attrstr

      result += attrstr + '>'

      if (customTags.indexOf(name) > -1 || attribs['data-path']) {
        parts.push(result)
        result = ''
        var requirePath = attribs['data-path'] || '../' + name + '/index'
        parts.push({ require: util.format('"%s"', requirePath) })
      }

    },
    ontext: function(text){
      result += text
    },
    onclosetag: function(tagname){
      result += '</' + tagname + '>'
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
