if (window.location.pathname === '/') {
    document.addEventListener('mousemove', (e) => {

        let recalculatedX = 100 - (e.clientX / window.innerWidth) * 100;
        document.documentElement.style.setProperty('--value', recalculatedX + '%');
    });
    document.body.style.overflow = "hidden";

}

