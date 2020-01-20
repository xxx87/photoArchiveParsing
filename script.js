const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');
const ep = new exiftool.ExiftoolProcess(exiftoolBin);
const fs = require('fs');
const path = require('path');

let pathIn = 'D:\\Programming\\test_template\\NodeExif\\inFoto';
let pathOut = 'D:\\Programming\\test_template\\NodeExif\\outFoto';

startFoto(pathIn, pathOut);

function startFoto(inP, outP) {

	let pathInData = inP;
	let pathOutData = outP;
	let pathUnknownFoto = pathOutData + '/unknownFoto';

	if(!fs.existsSync(pathUnknownFoto)) {
		fs.mkdirSync(pathUnknownFoto);
	}

	ep
		.open()
		.then(() => console.time('FirstWay'))
		.then(() => ep.readMetadata(pathInData, ['-File:all, -r']))
		.then(resp => {
			let metaData = resp['data']; // Array
			metaData.forEach(item => {
				let isCreateDate = Boolean(item['CreateDate']);
				let itemSourceFile = item['SourceFile'];

				if(isCreateDate) {
					let createDate = item['CreateDate'];
					let searchName = itemSourceFile.lastIndexOf('/');
					let fileName = itemSourceFile.substr(searchName);
					let ymd = createDate.split(' ')[0];

					let y = ymd.split(':')[0];
					let m = ymd.split(':')[1];
					let d = ymd.split(':')[2];

					if(!fs.existsSync(pathOutData + '/' + y)) {
						fs.mkdirSync(pathOutData + '/' + y);
					}
					if(!fs.existsSync(pathOutData + '/' + y + '/' + m)) {
						fs.mkdirSync(pathOutData + '/' + y + '/' + m);
					}
					if(!fs.existsSync(pathOutData + '/' + y + '/' + m + '/' + d)) {
						fs.mkdirSync(pathOutData + '/' + y + '/' + m + '/' + d);
					}
					let pathToOutFile = pathOutData + '/' + y + '/' + m + '/' + d + '/' + fileName;
					if(!fs.existsSync(pathToOutFile)) {
						fs.copyFile(itemSourceFile, pathToOutFile, (err) => {
							if(err) throw err;
						});
					}

				} else {
					let splitSourceFilePath = itemSourceFile.split('/');
					let lenSrt = splitSourceFilePath.length;

					let fileName = splitSourceFilePath[lenSrt - 1];
					let fileFolder = splitSourceFilePath[lenSrt - 2];

					if(!fs.existsSync(path.join(pathUnknownFoto, fileFolder))) {
						fs.mkdirSync(path.join(pathUnknownFoto, fileFolder));
					}
					if(!fs.existsSync(path.join(pathUnknownFoto, fileFolder, fileName))) {
						fs.copyFile(itemSourceFile, path.join(pathUnknownFoto, fileFolder, fileName), (err) => {
							if(err) throw err;
						});
					}
				}
			})
		})
		.then(() => console.timeEnd('FirstWay'))
		.then(() => ep.close())
		.catch(console.error);
}
