/*
 * grunt-lear
 * https://github.com/eward/grunt-lear
 *
 * Copyright (c) 2013 shepherdwind
 * Licensed under the MIT license.
 */
'use strict'

var path = require("path")
var parse = require("./htmlParser").parse
var fs = require("fs")
var util = require("util")

module.exports = function (grunt) {

  var Template = "" + 
      "/**\n" +
      " * Generated By grunt-lear\n" +
      " */\n" +
      "KISSY.add(function(S<%= requiresObj %>){\n" +
      "    return '<%= tpl %>;'\n" +
      "}, {requires: [<%= requires %>]});"

  var cwd = process.cwd()

  function kissy_template(src, dest, requires, requiresObj) {

    var moduleJS = grunt.template.process(Template, { 
      data: { 
        tpl: src ,
        requires: requires.join(','),
        requiresObj: requiresObj
      } 
    })

    grunt.file.write(dest, moduleJS)
    grunt.log.writeln('File "' + dest + '" created.')
  }

  grunt.registerMultiTask('lear', 'Your task description goes here.', function () {

    var data = this.data
    var pwd = path.join(cwd, data.cwd);
    //var options = this.options({})

    this.files.forEach(function (file) {

      var src = file.src.filter(function (filepath) {

        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.')
          return false
        } else {
          return true
        }

      }).map(function (filepath) {

        var content =  grunt.file.read(filepath).replace(/\n+/g, '\\n'). replace(/'/g, '\\\'')

        var dirs = fs.readdirSync(pwd).filter(function(file){
          var stat = fs.statSync(path.join(pwd, file))
          return stat.isDirectory()
        })

        var dest = filepath + '.js'
        var parts = parse(content, dirs)
        var requires = []
        var requiresObj = []
        content = ''

        parts.forEach(function(part){

          if (typeof part == 'string'){
            content += part
          } else {
            var tagName = 'tag' + Object.keys(requires).length
            content += '\' + ' + tagName + ' + \''
            requires.push(part.require)
            requiresObj.push(tagName)
          }

        })

        requiresObj = requiresObj.length > 0 ? ',' + requiresObj.join(',') : ''
        kissy_template(content, dest, requires, requiresObj)

        return content

      }).join(' ')

    })
  })

}