var decimalDigit = 3;

function byteToMB(value) {
    return parseFloat((parseFloat(value) / 1024 / 1024).toFixed(decimalDigit));
}

function byteToGB(value) {
    return parseFloat((parseFloat(value) / 1024 / 1024 / 1024).toFixed(decimalDigit));
}

function GBToByte(value) {
    return (Math.round(value * 1024 * 1024 * 1024));
}

function toFloatCustom(value) {
    return parseFloat(parseFloat(value).toFixed(decimalDigit));
}