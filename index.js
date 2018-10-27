/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
/*global Uint8Array, console */
/* exported export_xlsx */
/* eslint no-use-before-define:0 */
var XLSX = require('xlsx');
var electron = require('electron').remote;
var path = require('path');
var xlsxj = require("xlsx-to-json");
var fs = require('fs');
// var to_xml = require('to_xml');
var convert = require('xml-js');

var process_wb = (function () {
	var HTMLOUT = document.getElementById('htmlout');
	var XLSXPORT = document.getElementById('xlsxport');
	var JSONXPORT = document.getElementById('jsonxport');
	var XMLXPORT = document.getElementById('xmlxport');

	return function process_wb(wb) {
		XLSXPORT.disabled = false;
		JSONXPORT.disabled = false;
		XMLXPORT.disabled = false;
		HTMLOUT.innerHTML = "";
		wb.SheetNames.forEach(function (sheetName) {
			var htmlstr = XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
				editable: true
			});
			HTMLOUT.innerHTML += htmlstr;
		});
	};
})();

var do_file = (function () {
	return function do_file(files) {
		var f = files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			var data = e.target.result;
			data = new Uint8Array(data);
			process_wb(XLSX.read(data, {
				type: 'array'
			}));
		};
		reader.readAsArrayBuffer(f);
	};
})();

(function () {
	var drop = document.getElementById('drop');

	function handleDrop(e) {
		e.stopPropagation();
		e.preventDefault();
		do_file(e.dataTransfer.files);
	}

	function handleDragover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}

	drop.addEventListener('dragenter', handleDragover, false);
	drop.addEventListener('dragover', handleDragover, false);
	drop.addEventListener('drop', handleDrop, false);
})();

(function () {
	var readf = document.getElementById('readf');

	function handleF( /*e*/ ) {
		var o = electron.dialog.showOpenDialog({
			title: 'Select a file',
			filters: [{
				name: "Spreadsheets",
				extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw|htm|html".split("|")
			}],
			properties: ['openFile']
		});
		if (o.length > 0) process_wb(XLSX.readFile(o[0]));
	}
	readf.addEventListener('click', handleF, false);
})();

(function () {
	var xlf = document.getElementById('xlf');

	function handleFile(e) {
		do_file(e.target.files);
	}
	xlf.addEventListener('change', handleFile, false);
})();

var export_xlsx = (function () {
	var HTMLOUT = document.getElementById('htmlout');
	var XTENSION = "xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html".split("|")
	return function () {
		var wb = XLSX.utils.table_to_book(HTMLOUT);
		var o = electron.dialog.showSaveDialog({
			title: 'Save file as',
			filters: [{
				name: "Spreadsheets",
				extensions: XTENSION
			}]
		});
		console.log(o);
		if (o) {
			XLSX.writeFile(wb, o);
			electron.dialog.showMessageBox({
				message: "Exported data to " + o,
				buttons: ["OK"]
			});
		} else {
			//electron.dialog.showMessageBox({ message: "Exported data to " + o, buttons: ["OK"] });
		}
	};
})();
void export_xlsx;
//JSON
var export_json = (function () {
	var HTMLOUT = document.getElementById('htmlout');
	var XTENSION = "json|JSON".split("|")
	return function () {
		var wb = XLSX.utils.table_to_book(HTMLOUT);
		var o = electron.dialog.showSaveDialog({
			title: 'Save file as',
			filters: [{
				name: "json",
				extensions: XTENSION
			}]
		});
		console.log(o);
		if (o) {
			try {
					var jsonStr = JSON.stringify(wb);
					// var result1 = convert.xml2json(jsonStr, {compact: true, spaces: 4});
					fs.writeFileSync(o, jsonStr, 'utf-8');
					new HttpRequest().execCMD('read.bat '+o,'htmlout');
			} catch (e) {
				alert(e.message);
			}
			electron.dialog.showMessageBox({
				message: "Exported data to " + o,
				buttons: ["OK"]
			});
		} else {
			electron.dialog.showMessageBox({ message: "Export cancelled ", buttons: ["OK"] });
		}
	};
})();
//XML
var export_xml = (function () {
	var HTMLOUT = document.getElementById('htmlout');
	var XTENSION = "xml|XML".split("|")
	return function () {
		var wb = XLSX.utils.table_to_book(HTMLOUT);
		var o = electron.dialog.showSaveDialog({
			title: 'Save file as',
			filters: [{
				name: "xml",
				extensions: XTENSION
			}]
		});
		console.log(o);
		if (o) {
			try {
					var jsonStr = JSON.stringify(wb);
					var result1 = convert.json2xml(jsonStr, {compact: true, spaces: 4});
					fs.writeFileSync(o, result1, 'utf-8');
					new HttpRequest().execCMD('read.bat '+o,'htmlout');
			} catch (e) {
				alert(e.message);
			}
			electron.dialog.showMessageBox({
				message: "Exported data to " + o,
				buttons: ["OK"]
			});
		} else {
			electron.dialog.showMessageBox({ message: "Export cancelled ", buttons: ["OK"] });
		}
	};
})();
function doit(type, fn, dl) {
	var elt = document.getElementById('htmlout');
	var wb = XLSX.utils.table_to_book(elt, {
		sheet: "LetzteChance.Org"
	});
	return dl ?
		XLSX.write(wb, {
			bookType: type,
			bookSST: true,
			type: 'base64'
		}) :
		XLSX.writeFile(wb, fn || ('test.' + (type || 'xlsx')));
}