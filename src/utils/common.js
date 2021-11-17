import HyphenateStyleName from "hyphenate-style-name";

export const getUUid = () => {
    let s = [];
    let hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
}

export const WidthCalculator = (css) => {
    if(!css) {
        return 0;
    }

    const cssStyles = {};
    let width = 0;

    Object.keys(css || {}).forEach(key => {
        cssStyles[HyphenateStyleName(key)] = !isNaN(css[key]) ? css[key] + "px" : css[key];

        switch (HyphenateStyleName(key)) {
            case "padding": {
                const item = css[key].split(" ");
                if(item.length === 4) {
                    width += +item[1].replace("px", "") + +item[3].replace("px", "");
                } else if(item.length === 2) {
                    width += +item[1].replace("px", "") * 2;
                } else {
                    width += +item[0].replace("px", "") * 2;
                }

                break;
            }
            case "padding-left":
            case "padding-right": {
                width += +css[key].replace("px", "");
                break;
            }
        }
    });

    return width;
}