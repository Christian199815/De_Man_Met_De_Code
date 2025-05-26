export function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) console.warn(`Element with selector "${selector}" not found`);
    return element;
}


export function getAllElements(selector) {
    const elements = document.querySelectorAll(selector);
    if (!elements) console.warn(`Elements with selector "${selector}" not found`);
    return elements;
}
