
export function getUrlParameter(parameter, defaultValue) {
    try {
        const value = new URLSearchParams(window.location.search).get(parameter);
        return value? value : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

export function stringToHex(str) {
    return Array.from(str).reduce((hex, c) => hex += c.charCodeAt(0).toString(16).padStart(2, '0'), '');
}

export function hexToString(hex) {
    return hex.match(/.{1,2}/g).reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)),"");
}
