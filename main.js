var font = {};
var fileName = "project.sb3";
var fontSize = 32;
var fontName = "";
var kerningPairs = [];

var charset = "";

function setCharsetPreset(preset) {

    let cs = document.getElementById("charset");

    switch (preset) {
        case 'basic':
            cs.value = ` abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=[]\\;',./_+{}|:"<>?\`~`
            break;
        case 'expanded':
            cs.value = ` abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-–—=[]\\;'‘’,./_+{}|:∶"“”<>?\`~†‡‹›«»‚„¡¿¢€£¥₹₨₩₽¤°′″‴≠≈≤≥−×⋅÷±√‰‱¦§©℗®™℠¬¹²³µ¶·ªº¼½¾ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ`;
            break;
        case 'expanded+':
            cs.value = ` abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-–—=[]\\;'‘’,./_+{}|:∶"“”<>?\`~†‡‹›«»‚„¡¿¢€£¥₹₨₩₽¤°′″‴≠≈≤≥−×⋅÷±√‰‱¦§©℗®™℠¬¹²³µ¶·ªº¼½¾ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ`;
            break;
        case 'expanded++':
            cs.value = ` abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-–—=[]\\;'‘’,./_+{}|:∶"“”<>?\`~†‡‹›«»‚„¡¿¢€£¥₹₨₩₽¤°′″‴≠≈≤≥−×⋅÷±√‰‱¦§©℗®™℠¬¹²³µ¶·ªº¼½¾ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſαβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ`;
            break;
        default:
        case 'default':
            cs.value = ` abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-–—=[]\\;'‘’,./_+{}|:∶"“”<>?\`~†‡‹›«»‚„¡¿¢€£¥₹₨₩₽¤°′″‴≠≈≤≥−×⋅÷±√‰‱¦`;
            break;
    }

    updateCharCountDisplay();

}

function getCharsetFromFont() {

    if (!font.charToGlyph) {
        return null;
    }

    let cs = ""+(document.getElementById("charset").value);
        
    let newCharset = " ";
    let newCharsetMap = new Map();
    newCharsetMap.set(' ', true);

    for (let c of cs) {

        let fontChar = font.charToGlyph(c)
        if (fontChar == null) continue;
        if (fontChar.name == '.notdef' || fontChar.unicode == null) continue;

        if (!newCharsetMap.get(c)) {
            newCharsetMap.set(c, true);
            newCharset += c;
        }
    }

    return newCharset;

}

function updateCharCountDisplay() {

    let cs = getCharsetFromFont();
    let display = document.getElementById("charCountDisplay");

    if (cs == null) {
        display.innerHTML = "The character count will appear here once a font is loaded";
    } else {
        display.innerHTML = `${cs.length} characters to be injected with ${document.getElementById("fontName").value}`;
    }

}

function md5(text) {
    return CryptoJS.MD5(text).toString();
}

function openFont(event) {
    let reader = new FileReader();
    reader.onload = function() {
        font = opentype.parse(reader.result);
        const bounds = font.getPath('H', 0, 0, 1).getBoundingBox();
        fontSize = 32 / (bounds.y2 - bounds.y1);

        let name = font.names.fullName.en;
        if (name != null) {
            name = name.replace(" Regular", "").replace(" Normal", "").replace(" Book", "");
            name = name.replace(" regular", "").replace(" normal", "").replace(" book", "");
            document.getElementById("fontName").value = name;
        }

        updateCharCountDisplay();
    }

    document.getElementById("fontFileName").innerHTML = event.target.files[0].name;
    document.getElementById("fontName").value = event.target.files[0].name;
    reader.readAsArrayBuffer(event.target.files[0]);
}

function updateSb3FileName(event) {
    fileName = event.target.files[0].name;
    document.getElementById("sb3FileName").innerHTML = fileName;
}

function openSb3() {
    let reader = new FileReader();
    reader.onload = function() {
        JSZip.loadAsync(reader.result).then(inject);
    }

    const target = document.getElementById("sb3File");
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

        const fName = getList(sprite, "zzsfe_fName");
        if (fName === "Error") {
            alert("Error: Sprite does not have \"zzsfe_fName\" list");
            return;
        }

        const fStart = getList(sprite, "zzsfe_fStart");
        if (fStart === "Error") {
            alert("Error: Sprite does not have \"zzsfe_fStart\" list");
            return;
        }

        const fLicense = getList(sprite, "zzsfe_fLicense");
        if (fLicense === "Error") {
            alert("Error: Sprite does not have \"zzsfe_fLicense\" list");
            return;
        }

        const cWidth = getList(sprite, "zzsfe_cWidth");
        if (cWidth === "Error") {
            alert("Error: Sprite does not have \"zzsfe_cWidth\" list");
            return;
        }
        const cKern = getList(sprite, "zzsfe_cKern");
        if (cKern === "Error") {
            alert("Error: Sprite does not have \"zzsfe_cKern\" list");
            return;
        }

        if (document.getElementById("resetData").checked) {

            if (confirm("Font data will be reset instead of injecting a font. Continue?")) {

                let costumes = {};
                for (let i = 0; i < project.targets.length; i++) {
                    if (project.targets[i].name !== spriteName) {
                        for (let j = 0; j < project.targets[i].costumes.length; j++) {
                            costumes[project.targets[i].costumes[j].md5ext] = true;
                        }
                    }
                }

                for (let i = 2; i < sprite.costumes.length; i++) {
                    let assetFile = sprite.costumes[i].md5ext;
                    if (!costumes[assetFile]) sb3.remove(assetFile);
                }

                setList(sprite, "zzsfe_cWidth", [0, 0]);
                setList(sprite, "zzsfe_cKern", ["", ""]);
                setList(sprite, "zzsfe_fName", []);
                setList(sprite, "zzsfe_fStart", []);
                setList(sprite, "zzsfe_fLicense", []);
                sprite.costumes = sprite.costumes.slice(0, 2);

                sb3.file("project.json", JSON.stringify(project));
                sb3.generateAsync({type:"base64"}).then(download);

            }

            return;

        }

        cWidth[0] = 0;
        cWidth[1] = 0;
        cKern[0] = "";
        cKern[1] = "";
        
        fontName = document.getElementById("fontName").value.toLowerCase();
        let index = fName.map((value) => value.toLowerCase()).indexOf(fontName);

        let names = font.names;

        if (!names.hasOwnProperty('copyright')) {
            names.copyright = {'en': 'No copyright provided'};
        }

        let language = null;
        if (names.copyright.hasOwnProperty('en')) {
            language = 'en';
        } else {
            for (lang in names.copyright) {
                if (names.copyright.hasOwnProperty(lang)) {
                    language = lang;
                    break;
                }
            }
        }

        if (!names.hasOwnProperty('license')) {
            names.license = {};
            names.license[language] = 'No license provided';
        }

        let license = '';
        if (language != null) {
            license = `${names.copyright[language]} ${names.license[language]}`;
        }

        if (index === -1) {

            fName.push(fontName);
            fStart.push(sprite.costumes.length);
            fLicense.push(license);
            index = fName.length - 1;

        } else {

            fLicense[index] = license;

        }


        let fontId = `_${index}`;

        if (index === -1) {

            index = fontNames.length;
            fName.push(fontName.toLowerCase());
            fStart.push(sprite.costumes.length);
            costumeIndex = -1;
            fontId = (index + 1) + ":";

        } else {

            let costumes = {};
            for (let i = 0; i < project.targets.length; i++) {
                if (project.targets[i].name !== spriteName) {
                    for (let j = 0; j < project.targets[i].costumes.length; j++) {
                        costumes[project.targets[i].costumes[j].md5ext] = true;
                    }
                }
            }

            let end = sprite.costumes.length;
            if (((index + 1) < fStart.length) && (fStart[index + 1] < end)) {
                end = fStart[index + 1];
            }

            for (let i = fStart[index]; i < end; i++) {
                let assetFile = sprite.costumes[i].md5ext;
                if (!costumes[assetFile]) sb3.remove(assetFile);
            }

        }

        let newCostumes = [];
        let newCWidth = [];
        let newCKern = [];

        let end = fStart[index];
        for (let i = 0; i < end; i++) {
            newCostumes.push(sprite.costumes[i]);
            newCWidth.push(cWidth[i]);
            newCKern.push(cKern[i]);
        }

        charset = getCharsetFromFont();

        for (let i = 0; i < charset.length; i++) {
            let path = font.getPath(charset.charAt(i), 240, 180, fontSize).toPathData(3);
            let svg = `<svg width="480px" height="360px" xmlns="http://www.w3.org/2000/svg"><rect x="208" y="116" width="96.5" height="96.5" fill-opacity="0"/><path fill="#F00" d="${path}"/></svg>`
            let md5Value = md5(svg);

            newCostumes.push({
                assetId: md5Value,
                name: charset.charAt(i) + fontId,
                md5ext: md5Value + ".svg",
                dataFormat: "svg",
                bitmapResolution: 1,
                rotationCenterX: 240,
                rotationCenterY: 180
            });
            newCWidth.push(Math.round(1000 * font.getAdvanceWidth(charset.charAt(i), fontSize))/32000);

            sb3.file(md5Value + ".svg", svg);
        }

        addKerning(font, fontSize / 32.0, newCKern);

        if ((index + 1) < fName.length) {

            let offset = newCostumes.length - fStart[index + 1];

            for (let i = fStart[index + 1]; i < sprite.costumes.length; i++) {
                newCostumes.push(sprite.costumes[i]);
                newCWidth.push(cWidth[i]);
                newCKern.push(cKern[i]);
            }

            for (let i = index + 1; i < fStart.length; i++) {
                fStart[i] += offset;
            }

        }

        setList(sprite, "zzsfe_cWidth", newCWidth);
        setList(sprite, "zzsfe_cKern", newCKern);
        sprite.costumes = newCostumes;

        for (let i = 0; i < project.monitors.length; i++) {
            let monitor = project.monitors[i];
            if (monitor.hasOwnProperty('params')) {
                if ((monitor.params.LIST === "zzsfe_cKern") && monitor.spriteName === spriteName) {
                    project.monitors.splice(i, 1);
                }
            }
        }

        sb3.file("project.json", JSON.stringify(project));
        sb3.generateAsync({type:"base64"}).then(download);

    }

    function addKerning(font, fontSize, newCKern) {

        let glyphs = [];
        for (let c of charset) {
            glyphs.push(font.charToGlyph(c));
        }

        let pairs = [];

        for (let i = 0; i < glyphs.length; i++) {

            let glyph = glyphs[i];
            let kerning = [];

            for (let j = 0; j < glyphs.length; j++) {
                let kerningValue = +font.getKerningValue(glyphs[j], glyph);
                kerningValue = 1000 * round(kerningValue / font.unitsPerEm * fontSize);
                if (!Number.isNaN(kerningValue) && kerningValue !== 0) {
                    kerning[j] = kerningValue;
                    pairs.push([''+charset[j]+charset[i], kerningValue / 1000]);
                }
            }

            let kerningText = '';
            for (let kerningValue of kerning) {
                if (kerningValue == null) {
                    kerningValue = 0;
                }
                kerningText += formatNumFixedLength(kerningValue);
            }

            newCKern.push(kerningText);
        }

        pairs.sort((a, b) => (Math.abs(b[1]) - Math.abs(a[1])));
        kerningPairs = pairs; // So I can find kerning pairs to demonstrate

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

    function setList(sprite, listName, listData) {
        const lists = Object.values(sprite.lists);
        for (let i = 0; i < lists.length; i++) {
            if (lists[i][0] === listName) lists[i][1] = listData;
        }
    }

}

function download(data) {
    var link = document.createElement("a");
    link.style.display = "none";
    link.download = fileName;
    link.href = "data:application/zip;base64," + data;
    document.body.appendChild(link);
    link.click();
    alert("The project has been downloaded");
}

function round(n) {
    return +((+n).toFixed(4));
}

function formatNumFixedLength(n) {

    n = +n;

    let len = 4; // May get garbage digits at the end if the length is too high
    let s = '';

    if (len < 1) {
        return s;
    }

    if (Number.isNaN(n)) {
        for (let i = 0; i < len; i++) {
            s += 'NaN'.charAt(i % 3);
        }
        return s;
    }

    if (n === 0) {

        s += '0';
        if (len > 1) {
            s += '.';
        }

        for (let i = 2; i < len; i++) {
            s += '0';
        }
        return s;
    }

    if (n < 0) {
        if (len < 2) {
            s += '0';
            return s;
        }
        n *= -1;
        s += '-';
        len--;
    }

    if (n === Infinity) {
        n = Number.MAX_VALUE;
    }

    let exponent = Math.floor(Math.log10(n));
    if (n >= (+('1e' + (exponent + 1)))) { // Remove effects of floating-point error
        exponent += 1;
    } else if (n < (+'1e' + exponent)) {
        exponent -= 1;
    }

    let mantissa = n / (+('1e' + exponent)); // 10 ** exponent may introduce error, so this is used instead (base 10 with floats is weird anyway)

    if (exponent < 0) {

        if (len < 2) {
            s += '0';
            return s;
        }

        const fixedPrecision = len + exponent;
        const expString = (''+(-1*exponent));

        if ((fixedPrecision < len - expString.length - 3)) {

            if (len < expString.length + 3) {
                s += '0';
                len--;
                if (len > 0) {
                    s += '.';
                    len--;
                }

                for (let i = 0; i < len; i++) {
                    s += '0';
                }

                return s;
            }

            len -= (expString.length + 2);

            for (let i = 0; i < len; i++) {
                if (len - i === 1) {
                    s += ('' + Math.round(mantissa % 10)).charAt(0);
                } else {
                    s += ('' + Math.floor(mantissa % 10)).charAt(0);
                }
                if (i === 0 && len > 1) {
                    s += '.';
                    i++;
                }

                mantissa *= 10;
            }

            s += 'e-' + expString;
            return s;

        }

        s += '.';
        len--;

        for (let i = 0; i < len; i++) {
            n *= 10;
            if (len - i === 1) {
                s += ('' + Math.round(n % 10)).charAt(0);
            } else {
                s += ('' + Math.floor(n % 10)).charAt(0);
            }
        }

        return s;

    }
    
    if (exponent + 1 > len) {

        const expString = (''+exponent);

        if (expString.length + 2 > len) {
            s += '9';
            if (len < 2) {
                return s;
            }
            if (len < 3) {
                s += '9';
                return s;
            }
            s += 'e';
            for (let i = 2; i < len; i++) {
                s += '9';
            }
            return s;
        }

        len -= (expString.length + 1);

        for (let i = 0; i < len; i++) {
            if (len - i === 1) {
                s += ('' + Math.round(mantissa % 10)).charAt(0);
            } else {
                s += ('' + Math.floor(mantissa % 10)).charAt(0);
            }
            if (i === 0 && len > 1) {
                s += '.';
                i++;
            }

            mantissa *= 10;
        }

        s += 'e' + expString;
        return s;

    }


    for (let i = 0; i < len; i++) {
        if (len - i === 1) {
            s += ('' + Math.round(mantissa % 10)).charAt(0);
        } else {
            s += ('' + Math.floor(mantissa % 10)).charAt(0);
        }

        if ((exponent === 0) && (len - i) > 1) {
            s += '.';
            i++;
        }

        mantissa *= 10;
        exponent -= 1;
    }

    return s;

}