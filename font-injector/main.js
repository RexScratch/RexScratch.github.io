var font = {};
var fileName = "project.sb3";
var fontSize = 16;

function md5(text) {
    return CryptoJS.MD5(text).toString();
}

function openFont(event) {
    var reader = new FileReader();
    reader.onload = function() {
        font = opentype.parse(reader.result);
        const bounds = font.getPath('H', 0, 0, 1).getBoundingBox();
        fontSize = 16 / (bounds.y2 - bounds.y1);

        var name = font.names.fullName.en;
        if (name !== void 0) {
            name = name.replace(" Regular", "").replace(" Normal", "").replace(" Book", "");
            name = name.replace(" regular", "").replace(" normal", "").replace(" book", "");
            document.getElementById("fontName").value = name;
        }
    }

    reader.readAsArrayBuffer(event.target.files[0]);
}

function openSb3() {
    var reader = new FileReader();
    reader.onload = function() {
        JSZip.loadAsync(reader.result).then(inject);
    }

    const target = document.getElementById("sb3File");
    fileName = target.files[0].name;
    reader.readAsArrayBuffer(target.files[0]);
}

function inject(sb3) {
    spriteName = document.getElementById("spriteName").value;
    sb3.file("project.json").async("string").then(injectData);

    function injectData(project) {
        project = JSON.parse(project);
        sprite = getSprite(project, spriteName);
        if (sprite === "Error") {
            alert("Error: Sprite does not exist");
            return;
        }
        const fontNames = getList(sprite, "_fontNames");
        if (fontNames === "Error") {
            alert("Error: Sprite does not have \"_fontNames\" list");
            return;
        }
        const charWidths = getList(sprite, "_charWidths");
        if (charWidths === "Error") {
            alert("Error: Sprite does not have \"_charWidths\" list");
            return;
        }
        charWidths[0] = 0;
        charWidths[1] = 0;
        
        fontName = document.getElementById("fontName").value;
        var index = fontNames.map((value) => value.toLowerCase()).indexOf(fontName.toLowerCase());
        var costumeIndex;
        var fontId;
        if (index === -1) {
            index = fontNames.length;
            fontNames.push(fontName.toLowerCase());
            costumeIndex = -1;
            fontId = (index + 1) + ":";
        } else {

            const costumes = {};
            for (let i = 0; i < project.targets.length; i++) {
                if (project.targets[i].name !== spriteName) {
                    for (let j = 0; j < project.targets[i].costumes.length; j++) {
                        costumes[project.targets[i].costumes[j].md5ext] = true;
                    }
                }
            }

            fontId = (index + 1) + ":";
            costumeIndex = 0;
            while (sprite.costumes[costumeIndex].name.slice(0,2) !== fontId) {
                costumeIndex++;
            }

            var assetFile;
            while ((sprite.costumes.length > costumeIndex) && (sprite.costumes[costumeIndex].name.slice(0,2) === fontId)) {
                assetFile = sprite.costumes[costumeIndex].md5ext;
                if (costumes[assetFile] === void 0) sb3.remove(assetFile);
                sprite.costumes.splice(costumeIndex, 1);
                charWidths.splice(costumeIndex, 1);
            }

            if (index === fontNames.length - 1) costumeIndex = -1;

        }

        var charset = document.getElementById("charset").value;
        if (charset.indexOf(" ") === -1) {
            charset = " " + charset;
        }

        var path;
        var svg;
        var md5Value;
        if (costumeIndex === -1) {
            for (let i = 0; i < charset.length; i++) {
                path = font.getPath(charset.charAt(i), 240, 180, fontSize).toPathData(3);
                svg = `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><path fill="#F00" d="${path}"/></svg>`
                md5Value = md5(svg);

                sprite.costumes.push({
                    assetId: md5Value,
                    name: fontId + charset.charAt(i),
                    md5ext: md5Value + ".svg",
                    dataFormat: "svg",
                    bitmapResolution: 1,
                    rotationCenterX: 240,
                    rotationCenterY: 180
                });
                charWidths.push(Math.round(1000 * font.getAdvanceWidth(charset.charAt(i), fontSize))/16000);

                sb3.file(md5Value + ".svg", svg);
            }
        } else {
            for (let i = 0; i < charset.length; i++) {
                path = font.getPath(charset.charAt(i), 240, 180, fontSize).toPathData(3);
                svg = `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><path fill="#F00" d="${path}"/></svg>`
                md5Value = md5(svg);

                sprite.costumes.splice(costumeIndex, 0, {
                    assetId: md5Value,
                    name: fontId + charset.charAt(i),
                    md5ext: md5Value + ".svg",
                    dataFormat: "svg",
                    bitmapResolution: 1,
                    rotationCenterX: 240,
                    rotationCenterY: 180
                });
                charWidths.splice(costumeIndex, 0, Math.round(1000 * font.getAdvanceWidth(charset.charAt(i), fontSize))/16000);

                sb3.file(md5Value + ".svg", svg);
                
                costumeIndex++;
            }
        }

        sb3.file("project.json", JSON.stringify(project));
        sb3.generateAsync({type:"base64"}).then(download);

    }

    function getSprite(data, spriteName) {
        data = data.targets;
        for (let i = 0; i < data.length; i++) {
            if (data[i].name === spriteName) return data[i];
        }
        return "Error";
    }

    function getList(sprite, listName) {
        const lists = Object.values(sprite.lists);
        for (let i = 0; i < lists.length; i++) {
            if (lists[i][0] === listName) return lists[i][1];
        }
        return "Error";
    }

}

function download(data) {
    var link = document.createElement("a");
    link.download = fileName;
    link.href = "data:application/zip;base64," + data;
    link.click();
}