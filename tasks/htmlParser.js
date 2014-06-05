/*jsl:ignore*/
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

  // XTemplate中的等于符号，会引起问题，先转换为 #&equal;符号
  var str = str.replace(/{{[^}]+}}/g, function(reg){
    return reg.replace(/=/g, '#&equal;')
  })

  var parser = new htmlparser.Parser({

    onopentag: function(name, attribs){

      result += '<' + name;
      var attrstr = Object.keys(attribs).map(function(key){

        // 在属性中, {{@if a}}xx{{/if}} 会被识别为{{@if a}}xx{{ if}} 几个属性
        if (key.indexOf('{{') === -1 && key.indexOf('}}') === key.length - 2) {
          return '/' + key;
        }

        // {{@if x}}被识别为dom属性，需要忽略
        if (key.indexOf('{{') === -1){
          return util.format('%s="%s"', key, attribs[key])
        } else {
          return key.replace(/#&equal;/g, '=')
        }

      }).join(' ')

      attrstr = attrstr.replace(/\{\{ \//g, '{{/')

      if (attrstr.length > 0) attrstr = ' ' + attrstr

      result += attrstr + '>'

      if (customTags.indexOf(name) > -1 || attribs['data-path']) {
        parts.push(result + util.format('{{@with %s}}', name))
        result = ''
        var requirePath = attribs['data-path'] || '../' + name + '/index'
        parts.push({ require: util.format('"%s"', requirePath), tagname: name })
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
exports.parse = parse; /*jsl:end*/
