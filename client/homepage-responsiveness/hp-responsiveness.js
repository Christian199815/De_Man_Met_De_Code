const ranges = document.querySelectorAll('[type="range"]');

const updateRange = (range) => {
    const rangeName = range.name;
    const rangeValue = range.value;

    document.documentElement.style.setProperty("--" + rangeName, rangeValue);
};

ranges.forEach((range) => {
    updateRange(range);

    range.oninput = () => {
        updateRange(range);
    };
});
