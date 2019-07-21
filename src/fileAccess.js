var dirs = []

function createFileInput() {
  var inputObj = document.createElement('input')
  inputObj.setAttribute('id', '_ef');
  inputObj.setAttribute('type', 'file');
  inputObj.setAttribute("style", 'visibility:hidden');
  document.body.appendChild(inputObj);
}

function getPath(obj) {
  if (obj) {
    if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
      obj.select();
      return document.selection.createRange().text;
    }
    else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
      if (obj.files) {
        return obj.files.item(0).getAsDataURL();
      }
      return obj.value;
    }
    return obj.value;
  }
}

function getDirList(path) {
  var path = require("path");
  var fs = require("fs");
  fs.readdir(path, function (err, files) {
    //var dirs = [];
    (function iterator(i) {
      if (i == files.length) {
        console.log(dirs);
        return;
      }
      fs.stat(path.join(pathName, files[i]), function (err, data) {
        if (data.isFile()) {
          dirs.push(files[i]);
        }
        iterator(i + 1);
      });
    })(0);
  });
}



export default {
  methods: {
    getLocalList(path) {
      getDirList(path)
    },
    createFileInput,
    getPath
  }
}
