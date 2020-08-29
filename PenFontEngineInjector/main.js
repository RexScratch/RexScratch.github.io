font = {};
fileName = "project.sb3";
fontSize = 1;
progressSteps = 2;

function alertError(message) {
    alert('Error: ' + message);
    throw Error;
}

function formatNumFixedLength(n) {

    n = +n;

    var len = 4; // May get garbage digits at the end if the length is too high
    var s = '';

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

    var exponent = Math.floor(Math.log10(n));
    if (n >= (+('1e' + (exponent + 1)))) { // Remove effects of floating-point error
        exponent += 1;
    } else if (n < (+'1e' + exponent)) {
        exponent -= 1;
    }

    var mantissa = n / (+('1e' + exponent)); // 10 ** exponent may introduce error, so this is used instead (base 10 with floats is weird anyway)

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

function formatNum(n) {

    const PRECISION = 10;

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

        this.direction = 1;
        if (x1 < x0) {
            this.direction *= -1;
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        this.x0 = x0;
        this.x1 = x1;
        this.xmin = x0;
        this.xmax = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.ymin = Math.min(y0, y1);
        this.ymax = Math.max(y0, y1);
        this.slope = (y1 - y0) / (x1 - x0);

        this.isLine = true;
        this.isCurve = false;
    }

    static createLines(x0, y0, x1, y1) {

        // Creates an array of lines
        // This is used instead of a constructor because vertical lines should be ignored

        x0 = round(x0);
        y0 = round(-1 * y0);
        x1 = round(x1);
        y1 = round(-1 * y1);

        if (x0 === x1) {
            return [];
        }

        return [new Line(x0, y0, x1, y1)];
        
    }

    toString() {

        let str = 'L';

        let direction = Math.sign(this.direction);
        if (direction === 1) {
            str += '+';
        } else {
            str += '-';
        }
        str += ';';

        str += formatNum(this.x0) + ';';
        str += formatNum(this.x1) + ';';
        str += formatNum(4 * this.y0) + ';';
        str += formatNum(4 * this.slope) + ';';

        return str;
    }

}

class Curve {

    // Represents a quadratic Bézier curve

    constructor(x0, y0, x1, y1, x2, y2, directionMult) {

        x0 = round(x0);
        y0 = round(y0);
        x1 = round(x1);
        y1 = round(y1);
        x2 = round(x2);
        y2 = round(y2);

        this.direction = directionMult;
        if (x2 < x0) {
            this.direction *= -1;
            [x0, x2] = [x2, x0];
            [y0, y2] = [y2, y0];
        }

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

        this.xmin = x0;
        this.xmax = x2;

        // Solve for t when dy/dt = 0  
        const extremeT = (-1 * this.by) / (2 * this.ay);
        const extremeY = this.yOfT(extremeT);

        this.ymin = Math.min(y0, y2, extremeY);
        this.ymax = Math.max(y0, y2, extremeY);

        this.isLine = false;
        this.isCurve = true;
    }

    static createCurves(x0, y0, x1, y1, x2, y2, x3, y3) {

        // Creates an array of curves
        // This is used instead of a constructor because cubic curves need to be split
        // Quadratic curves may also be split if they cannot be expressed as a function of x

        x0 = round(x0);
        y0 = round(-1 * y0);
        x1 = round(x1);
        y1 = round(-1 * y1);
        x2 = round(x2);
        y2 = round(-1 * y2);

        if (x3 == null && y3 == null) {

            // The curve is quadratic

            if (x0 === x1 && x1 === x2) {
                return [];
            }

            let directionMult = 1;
            if (x2 < x0) {
                [x0, x2] = [x2, x0];
                [y0, y2] = [y2, y0];
                directionMult = -1;
            }

            if (x0 <= x1 && x1 <= x2) {
                return [new Curve(x0, y0, x1, y1, x2, y2, directionMult)];
            }

            // The curve cannot be expressed as a function of x

            const ax = x2 - 2 * x1 + x0;
            const bx = 2 * (x1 - x0);

            /*
            const cx = x0;

            const ay = y2 - 2 * y1 + y0;
            const by = 2 * (y1 - y0);
            const cy = y0;
            */

            // Solve for t when dx/dt = 0
            const extremeT = (-1 * bx) / (2 * ax);
            
            const controlX0 = lerp(x0, x1, extremeT);
            const controlY0 = lerp(y0, y1, extremeT);
            const controlX1 = lerp(x1, x2, extremeT);
            const controlY1 = lerp(y1, y2, extremeT);
            const midX = lerp(controlX0, controlX1, extremeT);
            const midY = lerp(controlY0, controlY1, extremeT);

            return [new Curve(x0, y0, controlX0, controlY0, midX, midY, directionMult), new Curve(midX, midY, controlX1, controlY1, x2, y2, directionMult)];

        }

        // The curve is cubic

        x3 = round(x3);
        y3 = round(-1 * y3);

        if (x0 === x1 && x1 === x2 & x2 === x3) {
            return [];
        }

        // Splits the cubic curves into 4 smaller cubic curves then approximates each smaller curve as a quadratic curve
        return Curve.splitCubic(x0, y0, x1, y1, x2, y2, x3, y3, 4);

    }

    static splitCubic(x0, y0, x1, y1, x2, y2, x3, y3, parts) {

        if (parts < 2) {
            return [Curve.approxCubic(x0, y0, x1, y1, x2, y2, x3, y3)];
        }

        const t = 1 / parts;

        let midX = lerp(x1, x2, t);
        let midY = lerp(y1, y2, t);

        const controlX0 = lerp(x0, x1, t);
        const controlX1 = lerp(controlX0, midX, t);
        const controlX3 = lerp(x2, x3, t);
        const controlX2 = lerp(midX, controlX3, t);

        const controlY0 = lerp(y0, y1, t);
        const controlY1 = lerp(controlY0, midY, t);
        const controlY3 = lerp(y2, y3, t);
        const controlY2 = lerp(midY, controlY3, t);

        midX = lerp(controlX1, controlX2, t);
        midY = lerp(controlY1, controlY2, t);

        let curves = [Curve.approxCubic(x0, y0, controlX0, controlY0, controlX1, controlY1, midX, midY)];
        curves = curves.concat(Curve.splitCubic(midX, midY, controlX2, controlY2, controlX3, controlY3, x3, y3, parts - 1));

        return curves;
    }

    static approxCubic(x0, y0, x1, y1, x2, y2, x3, y3) {

        // Approximates a cubic curve to a quadratic curve

        const controlX = (0.75 * x1 - 0.25 * x0) + (0.75 * x2 - 0.25 * x3);
        const controlY = (0.75 * y1 - 0.25 * y0) + (0.75 * y2 - 0.25 * y3);

        return new Curve(x0, y0, controlX, controlY, x3, y3, 1);

    }

    yOfT(t) {
        return this.ay * (t ** 2) + this.by * t + this.cy;
    }

    toString() {

        let str = 'Q';

        let direction = Math.sign(this.direction);
        if (direction === 1) {
            str += '+';
        } else {
            str += '-';
        }
        str += ';';

        str += formatNum(this.x0) + ';';
        str += formatNum(this.x1) + ';';

        if (this.ax === 0) {

            str += 'z;';
            str += '0;';
            str += formatNum(this.bx) + ';';
            str += formatNum(this.cx) + ';';

            str += formatNum(4 * this.ay) + ';';
            str += formatNum(4 * this.by) + ';';
            str += formatNum(4 * this.cy) + ';';

        } else {

            if (this.ax > 0) {
                str += 'p;';
            } else {
                str += 'm;';
            }
            /*
            str += formatNum(-1 * this.bx / this.ax) + ';';
            str += formatNum(4 / this.ax) + ';';
            str += formatNum(this.cx) + ';';
            */

            str += formatNum(-1 * this.bx) + ';';
            str += formatNum(this.ax) + ';';
            str += formatNum(this.cx) + ';';

            str += formatNum(4 * this.ay / 4) + ';';
            str += formatNum(4 * this.by / 2) + ';';
            str += formatNum(4 * this.cy) + ';';

        }

        return str;

    }

}

class FontEngine {
    
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

    addNewChar() {

        let last = this.l.chData0.length - 1
        if (this.l.chData0[last] === '__') {
            this.l.chData1[last] = 'none';
            this.l.chData2[last] = '';
            this.l.chData3[last] = '';
            this.l.chData4[last] = '';
        } else {
            this.l.chData0.push('__');
            this.l.chData1.push('none');
            this.l.chData2.push('');
            this.l.chData3.push('');
            this.l.chData4.push('');
        }
        let index = this.l.chIndex.length;
        this.l.chIndex.push(this.l.chData0.length);
        this.l.chWidth.push(0);
        this.l.chKern.push('');

        for (let i = 0; i < 110; i++) {
            this.l.chData0.push('');
            this.l.chData1.push('');
            this.l.chData2.push('');
            this.l.chData3.push('');
            this.l.chData4.push('');
        }

        this.l.chData0.push('__');
        this.l.chData1.push('none');
        this.l.chData2.push('');
        this.l.chData3.push('');
        this.l.chData4.push('');

        return index;
    }

    addChar(char, font, fontSize) {
        
        let glyph = font.charToGlyph(char);
        if (glyph.unicode == null) {
            return;
        }

        let index = NaN;

        if (this.addCostume(char + '_')) {
            index = this.addNewChar();
        } else {
            index = this.costumeIndex[char + '_'] - 1;
        }

        this.currentFont.push(index + 1);
        this.currentFont.push(round(font.getAdvanceWidth(char, fontSize)));
        this.currentFont.push(''); // kerning

        let path = glyph.getPath(0, 0, fontSize);
        let bounds = path.getBoundingBox();

        this.currentFont.push(round(bounds.x1));
        this.currentFont.push(round(bounds.x2));
        this.currentFont.push(round(-1 * bounds.y2));
        this.currentFont.push(round(-1 * bounds.y1));

        const commands = path.commands;
        let segments = [];
        let beginX = 0;
        let beginY = 0;
        let x = beginX;
        let y = beginY;

        for (let command of commands) {
            if (command.type === 'M') {
                beginX = command.x;
                beginY = command.y;
                x = beginX;
                y = beginY;
            } else if (command.type === 'L') {
                segments = segments.concat(Line.createLines(x, y, command.x, command.y));
                x = command.x;
                y = command.y;
            } else if (command.type === 'Q') {
                segments = segments.concat(Curve.createCurves(x, y, command.x1, command.y1, command.x, command.y));
                x = command.x;
                y = command.y;  
            } else if (command.type === 'C') {
                segments = segments.concat(Curve.createCurves(x, y, command.x1, command.y1, command.x2, command.y2, command.x, command.y));
                x = command.x;
                y = command.y;
            } else if (command.type === 'Z') {
                segments = segments.concat(Line.createLines(x, y, beginX, beginY));
                x = beginX;
                y = beginY;
            } else {
                alertError('Font is not compatible');
            }
        }

        let definition = '';
        definition += formatNum(segments.length) + ';;;;;';
        for (let segment of segments) {
            definition += segment.toString();
        }

        this.currentFont.push(definition);

    }

    addKerning(font, fontSize) {

        let charset = '';
        for (let i = 2; i < this.currentFont.length; i += 8) {
            charset += this.costumes[this.currentFont[i]].name.charAt(0);
        }

        let chars = {};
        for (let char of charset) {
            if (font.charToGlyph(char).unicode != null) {
                chars[char] = this.costumeIndex[char + '_'] - 1;
            }
        }

        let kerningPairs = [];

        for (let i = 0; i < charset.length; i++) {
            let char = charset.charAt(i);
            let glyph = font.charToGlyph(char);

            let kerning = [];
            if (char !== ' ') {
                for (let char2 in chars) {
                    if (chars.hasOwnProperty(char2)) {

                        let kerningValue = +font.getKerningValue(font.charToGlyph(char2), glyph);
                        if (char2 === ' ') {
                            kerningValue = 0.0;
                        }
                        kerningValue = 1000 * round(kerningValue / font.unitsPerEm * fontSize);
                        if (!Number.isNaN(kerningValue) && kerningValue !== 0) {
                            kerning[chars[char2]] = kerningValue;
                            kerningPairs.push([''+char2+char, kerningValue / 1000]);
                        }

                    } 
                }
            }

            let kerningText = '';
            for (let kerningValue of kerning) {
                if (kerningValue == null) {
                    kerningValue = 0;
                }
                kerningText += formatNumFixedLength(kerningValue);
            }

            this.currentFont[8 * i + 4] = kerningText;
        }

        kerningPairs.sort((a, b) => (Math.abs(b[1]) - Math.abs(a[1])));
        this.kerningPairs = kerningPairs; // So I can find kerning pairs to demonstrate

    }

    updateFontLists(font, fontName) {

        this.currentFont[1] = Math.round((this.currentFont.length - 2) / 8);

        let index = sprite.l.fontName.map((value) => value.toLowerCase()).indexOf(fontName.toLowerCase());
        
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

            this.l.fontName.push(fontName.toLowerCase());
            this.l.fontLicense.push(license);
            this.l.fontIndex.push(this.l.fontData.length + 1);
            for (let item of this.currentFont) {
                this.l.fontData.push(item);
            }

        } else {

            this.l.fontLicense[index] = license;

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

function openFont(event) {
    let reader = new FileReader();
    reader.onload = function() {
        font = opentype.parse(reader.result);
        const bounds = font.getPath('H', 0, 0, 1).getBoundingBox();
        fontSize = 1 / (bounds.y2 - bounds.y1);

        let name = font.names.fullName.en;
        if (name !== void 0) {
            name = name.replace(" Regular", "").replace(" Normal", "").replace(" Book", "");
            name = name.replace(" regular", "").replace(" normal", "").replace(" book", "");
            document.getElementById("fontName").value = name;
        }
    }

    reader.readAsArrayBuffer(event.target.files[0]);
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
        sprite = new FontEngine(project, spriteName);

        let listNames = [
            'chIndex',
            'chWidth',
            'chKern',
            'chData0',
            'chData1',
            'chData2',
            'chData3',
            'chData4',
            'fontName',
            'fontLicense',
            'fontIndex',
            'fontData',
            'cacheIdx',
            'cache0',
            'cache1',
        ];

        for (let listName of listNames) {
            sprite.getList(listName);
        }
        
        fontName = document.getElementById("fontName").value;
        sprite.currentFont.push(`${fontName}_${(new Date()).getTime()}`);
        sprite.currentFont.push(0);

        let charset = document.getElementById("charset").value;
        if (charset.indexOf(" ") === -1) {
            charset = " " + charset;
        }

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
                    sprite.l.chKern,
                    sprite.l.chData0,
                    sprite.l.chData1,
                    sprite.l.chData2,
                    sprite.l.chData3,
                    sprite.l.chData4,
                    sprite.l.fontName,
                    sprite.l.fontLicense,
                    sprite.l.fontIndex,
                    sprite.l.fontData,
                    sprite.l.cacheIdx,
                    sprite.l.cache0,
                    sprite.l.cache1
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
                    '_chKern',
                    '_chData0',
                    '_chData1',
                    '_chData2',
                    '_chData3',
                    '_chData4',
                    // '_fontName',
                    // '_fontLicense',
                    '_fontIndex',
                    '_fontData',
                    '_cacheIdx',
                    '_cache0',
                    '_cache1',
                    '_raster',
                    '_rasterDir',
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

            let useKerning = document.getElementById('useKerning').checked;

            if (sprite.l.chIndex.length === 0) {
                sprite.addNewChar();
            }
            
            for (let i = 0; i < charset.length; i++) {
                sprite.addChar(charset.charAt(i), font, fontSize);
            }

            if (useKerning) {
                sprite.addKerning(font, fontSize);
            } else {
            }

            sprite.updateFontLists(font, fontName);
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
