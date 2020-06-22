fileName = "project.sb3";
charset = '';
font = 'error';

function alertError(message) {
    alert('Error: ' + message);
    throw Error;
}

function search(str, substr, i=0) {
    let out = str.indexOf(substr, i);
    if (out === -1) {
        invalidFont();
    }
    return out;
}

function invalidFont() {
    font = 'error';
    alertError('Font data is not in the correct format');
}

function formatNum(n) {

    const PRECISION = 8;

    n = +n;
    if (Number.isNaN(n)) {
        return 'NaN';
    }

    if (n === Infinity) {
        return 'Infinity';
    }

    if (n === -Infinity) {
        return '-Infinity';
    }

    if (n === 0) {
        return '0';
    }

    const original = n;
    if (n < 0) {
        n *= -1;
    }

    let exponent = Math.floor(Math.log10(n));
    if (n >= (+('1e' + (exponent + 1)))) { // Remove effects of floating-point error
        exponent += 1;
    } else if (n < (+'1e' + exponent)) {
        exponent -= 1;
    }

    let mantissa = n / (+('1e' + exponent)); // 10 ** exponent may introduce error, so this is used instead (base 10 with floats is weird anyway)
    mantissa = +mantissa.toFixed(PRECISION - 1);

    let casted = ''+(+(''+(+mantissa.toFixed(PRECISION - 1)) + 'e' + ('' + exponent)));
    if (casted.length > 1 && casted.charAt(0) === '0') {
        casted = casted.slice(1);
    }

    const scientific = ''+mantissa + 'e' + ('' + exponent);

    if (scientific.length < casted.length) {
        if (original < 0) {
            return '-' + scientific;
        }
        return scientific;
    }

    if (original < 0) {
        return '-' + casted;
    }
    return casted;

}

function round(n) {
    return +((+n).toFixed(5));
}

function lerp(value0, value1, t) {
    return (1 - t) * value0 + t * value1;
}

class Line {

    constructor(x0, y0, x1, y1) {

        x0 = round(x0);
        y0 = round(y0);
        x1 = round(x1);
        y1 = round(y1);

        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;

        this.isLine = true;
        this.isCurve = false;
    }

    toString(containsCurves) {

        if (containsCurves) {

            let str = 'L;';
            str += formatNum(this.x1 - this.x0) + ';';
            str += formatNum(this.y1 - this.y0) + ';';
            str += ';';

            return str;

        }

        let str = '';
        str += formatNum(this.x1 - this.x0) + ';';
        str += formatNum(this.y1 - this.y0) + ';';
        str += ';;';

        return str;

    }

}

class Curve {

    // Represents a quadratic Bézier curve

    constructor(x0, y0, x1, y1, x2, y2) {

        x0 = round(x0);
        y0 = round(y0);
        x1 = round(x1);
        y1 = round(y1);
        x2 = round(x2);
        y2 = round(y2);

        x1 -= x0;
        x2 -= x0;
        x0 = 0.0;

        y1 -= y0;
        y2 -= y0;
        y0 = 0.0;

        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x2;
        this.y1 = y2;

        this.controlX = x1;
        this.controlY = y1;

        this.ax = x2 - 2 * x1 + x0;
        this.bx = 2 * (x1 - x0);
        this.cx = x0;

        this.ay = y2 - 2 * y1 + y0;
        this.by = 2 * (y1 - y0);
        this.cy = y0;

        this.ax = round(this.ax);
        this.bx = round(this.bx);
        this.cx = round(this.cx);

        this.ay = round(this.ay);
        this.by = round(this.by);
        this.cy = round(this.cy);

        this.isLine = false;
        this.isCurve = true;
    }

    toString(containsCurves) {

        let str = '';

        str += formatNum(2 * this.ax) + ';';
        str += formatNum(this.bx / 2) + ';';
        str += formatNum(2 * this.ay) + ';';
        str += formatNum(this.by / 2) + ';';

        return str;

    }

}

class TextEngine {
    
    constructor(project, spriteName) {

        let targets = project.targets;

        for (let target of targets) {

            if (target.name === spriteName) {

                for (let prop in target) {
                    if (target.hasOwnProperty(prop)) {
                        this[prop] = target[prop];
                    }
                }

                this.costumeIndex = {};
                for (let i = 0; i < this.costumes.length; i++) {
                    this.costumeIndex[this.costumes[i].name] = i;
                }

                this.baseCostume = this.costumes[1];

                this.l = {};
                this.currentFont = [];

                return this;
            }

        }

        alertError(`Sprite \'${spriteName}\' does not exist`);
    }

    getList(listName) {
        const lists = Object.values(this.lists);
        for (let list of lists) {
            if (list[0] === ('_' + listName)) {
                this.l[listName] = list[1];
                return true;
            }
        }
        
        alertError(`List \'_${listName}'\ does not exist`);
    }

    addCostume(costumeName) {
        if (this.costumeIndex.hasOwnProperty(costumeName)) {
            return false;
        }

        this.costumes.push({
            assetId: this.baseCostume.assetId,
            name: costumeName,
            md5ext: this.baseCostume.md5ext,
            dataFormat: this.baseCostume.dataFormat,
            bitmapResolution: this.baseCostume.bitmapResolution,
            rotationCenterX: this.baseCostume.rotationCenterX,
            rotationCenterY: this.baseCostume.rotationCenterY
        });

        this.costumeIndex[costumeName] = this.costumes.length - 1;

        return true;

    }

    static containsCurves(charData) {

        for (let i = 1; i < charData.length; i++) {
            if (charData[i].includes('Q')) {
                return true;
            }
        }
        
        return false;

    }

    addNewChar() {

        let last = this.l.chData0.length - 1
        if (this.l.chData0[last] === '__') {
            this.l.chData1[last] = 'none';
            this.l.chData2[last] = '';
            this.l.chData3[last] = '';
        } else {
            this.l.chData0.push('__');
            this.l.chData1.push('none');
            this.l.chData2.push('');
            this.l.chData3.push('');
        }
        let index = this.l.chIndex.length;
        this.l.chIndex.push(this.l.chData0.length + 1);
        this.l.chWidth.push(0);

        for (let i = 0; i < 25; i++) {
            this.l.chData0.push('');
            this.l.chData1.push('');
            this.l.chData2.push('');
            this.l.chData3.push('');
        }

        this.l.chData0.push('__');
        this.l.chData1.push('none');
        this.l.chData2.push('');
        this.l.chData3.push('');

        return index;
    }

    addChar(char, charData) {

        let index = NaN;

        if (this.addCostume(char + '_')) {
            index = this.addNewChar();
        } else {
            index = this.costumeIndex[char + '_'] - 1;
        }

        this.currentFont.push(index + 1);
        this.currentFont.push(charData[0]);

        let definition = '';
        const containsCurves = TextEngine.containsCurves(charData);
        definition += '';
        if (containsCurves) {
            definition += 'Q;';
        } else {
            definition += ';';
        }
        definition += ';;';

        let dotsDef = '';
        let dots = 0;

        let numPaths = 0;

        for (let i = 1; i < charData.length; i++) {

            let len = 0;
            let pathDef = '';
            let path = charData[i];
            let x = path[0];
            let y = path[1];
            let firstCoord = formatNum(x) + ';' + formatNum(y) + ';';

            if (path.length === 2) {
                dots++;
                dotsDef += firstCoord + ';;';
                continue;
            }

            numPaths++;

            for (let j = 2; j < path.length; len++) {

                if (path[j] === 'Q') {

                    let controlX = path[j + 1];
                    let controlY = path[j + 2];

                    let newX = path[j + 3];
                    let newY = path[j + 4];

                    pathDef += new Curve(x, y, controlX, controlY, newX, newY).toString(containsCurves);

                    x = newX;
                    y = newY;

                    j += 5;

                } else {

                    let newX = path[j];
                    let newY = path[j + 1];

                    pathDef += new Line(x, y, newX, newY).toString(containsCurves);

                    x = newX;
                    y = newY;

                    j += 2;

                }

            }

            pathDef = firstCoord + len + ';;' + pathDef;
            definition += pathDef;

        }
        
        definition = numPaths + ';' + definition + dots + ';;;;' + dotsDef;

        this.currentFont.push(definition);

    }

    updateFontLists(fontName) {

        this.currentFont[1] = Math.round((this.currentFont.length - 2) / 3);

        let index = sprite.l.fontName.map((value) => value.toLowerCase()).indexOf(fontName.toLowerCase());

        if (index === -1) {

            this.l.fontName.push(fontName.toLowerCase());
            this.l.fontIndex.push(this.l.fontData.length + 1);
            for (let item of this.currentFont) {
                this.l.fontData.push(item);
            }

        } else {

            let fontDataIndex = this.l.fontIndex[index];
            let currentLen = 0;

            if (index + 1 === this.l.fontName.length) {
                currentLen = this.l.fontData.length + 1 - fontDataIndex;
            } else {
                currentLen = this.l.fontIndex[index + 1] - fontDataIndex;

                let indexDiff = this.currentFont.length - currentLen;
                for (let i = index + 1; i < this.l.fontIndex.length; i++) {
                    this.l.fontIndex[i] += indexDiff;
                }
                
            }

            this.l.fontData.splice(fontDataIndex - 1, currentLen, ...this.currentFont);
            
        }
    }

}

function parseFont(event) {

    let fontData = event.target.value;
    charset = '';
    font = {};

    let i = 0;
    i = search(fontData, '{', i);
    i = search(fontData, '[', i + 1);

    let left = i;
    let right = search(fontData, ']', left + 1);
    document.getElementById('fontName').value = fontData.slice(left + 1, right);   

    i = right + 1;

    while (true) {

        let end = fontData.indexOf('}', i);
        let next = fontData.indexOf('[', i);

        if ((end < next) || next === -1) {
            return;
        }

        i = next;

        let char = [];

        font[fontData.charAt(i + 1)] = char;
        charset += fontData.charAt(i + 1);

        let left = i + 2;
        let right = search(fontData, ',', left + 1);

        let idx = fontData.indexOf(']', left + 1);

        if ((idx !== - 1) && (idx < right)) {
            char.push(round(+fontData.slice(left + 1, idx) / 100));
            i = idx + 1;
            continue;
        }

        char.push(round(+fontData.slice(left + 1, right) / 100));

        i = right;

        while (true) {

            let end = fontData.indexOf(']', i);
            let next = fontData.indexOf('(', i);

            if ((end < next) || (next === -1)) {
                break;
            }

            i = next + 1;

            path = [];

            while (true) {

                if (fontData.charAt(i) === 'b') {
                    path.push('Q');
                    i += 2;
                    continue;
                }

                exitLoop = false;

                let left = i;

                let right = Infinity;

                let idx = fontData.indexOf(',', i);
                if ((idx !== -1) && (idx < right)) {
                    right = idx;
                }
                idx = fontData.indexOf(';', i);
                if ((idx !== -1) && (idx < right)) {
                    right = idx;
                }
                idx = fontData.indexOf(')', i);
                if ((idx !== -1) && (idx < right)) {
                    right = idx;
                    exitLoop = true;
                }

                if (idx === Infinity) {
                    invalidFont();
                }

                path.push(round(+fontData.slice(left, right) / 100));

                i = right + 1;

                if (exitLoop) {
                    break;
                }

            }

            char.push(path);

        }

    }
    
}

function openSb3() {
    let reader = new FileReader();
    reader.onload = function() {
        JSZip.loadAsync(reader.result).then(inject);
    }

    const target = document.getElementById("sb3File");
    fileName = target.files[0].name;
    reader.readAsArrayBuffer(target.files[0]);
}

function clearArray(arr) { // Removes every item from an array
    arr.splice(0, arr.length);
}

function inject(sb3) {

    spriteName = document.getElementById("spriteName").value;
    sb3.file("project.json").async("string").then(injectData);

    function injectData(project) {
        
        const progressElem = document.getElementById("progress");

        progressElem.innerText = 'Parsing file...';
        project = JSON.parse(project);
        progressElem.innerText = 'Working...';
        sprite = new TextEngine(project, spriteName);

        let listNames = [
            'chIndex',
            'chWidth',
            'chData0',
            'chData1',
            'chData2',
            'chData3',
            'fontName',
            'fontIndex',
            'fontData'
        ];

        for (let listName of listNames) {
            sprite.getList(listName);
        }
        
        fontName = document.getElementById("fontName").value;
        sprite.currentFont.push(`${fontName}_${(new Date()).getTime()}`);
        sprite.currentFont.push(0);

        const clearData = document.getElementById("clearData").checked;
        const clearMonitors = document.getElementById("clearMonitors").checked;

        if (clearData || clearMonitors) {

            if (!confirm('Font injection will be disabled. Do you want to proceed?')) {
                return;
            }

            if (clearData) {

                let listsToClear = [
                    sprite.l.chIndex,
                    sprite.l.chWidth,
                    sprite.l.chData0,
                    sprite.l.chData1,
                    sprite.l.chData2,
                    sprite.l.chData3,
                    sprite.l.fontName,
                    sprite.l.fontIndex,
                    sprite.l.fontData,
                ];

                for (list of listsToClear) {
                    clearArray(list);
                }

                sprite.costumes.splice(2, sprite.costumes.length - 2);
                sprite.addNewChar();
            
            }

            if (clearMonitors) {

                listNames = [
                    '_chIndex',
                    '_chWidth',
                    '_chData0',
                    '_chData1',
                    '_chData2',
                    '_chData3',
                    // '_fontName',
                    '_fontIndex',
                    '_fontData',
                    '_ww0',
                    '_ww1',
                    '_ww2'
                ];

                for (let i = 0; i < project.monitors.length; i++) {
                    let monitor = project.monitors[i];
                    if (monitor.hasOwnProperty('params')) {
                        if (listNames.includes(monitor.params.LIST) && monitor.spriteName === spriteName) {
                            project.monitors.splice(i, 1);
                        }
                    }
                }

            }

        } else {

            if (font === 'error') {
                invalidFont();
            }

            if (sprite.l.chIndex.length === 0) {
                sprite.addNewChar();
            }
            
            for (let i = 0; i < charset.length; i++) {
                let c = charset.charAt(i);
                sprite.addChar(c, font[c]);
            }

            sprite.updateFontLists(fontName);
        }

        progressElem.innerText = 'Creating file...';
        sb3.file("project.json", JSON.stringify(project));
        
        progressElem.innerText = 'Downloading...';
        sb3.generateAsync({type:"base64"}).then(download);

    }

}

function download(data) {
    const progressElem = document.getElementById("progress");
    let link = document.createElement("a");
    link.style.display = "none";
    link.download = fileName;
    link.href = "data:application/zip;base64," + data;
    document.body.appendChild(link);
    link.click();
    progressElem.innerText = '';
    alert("The project has been downloaded");
}