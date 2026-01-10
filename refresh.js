(function () {
    function addButton(){
        const head = document.querySelector('.head__body');

        // Не добавляем второй раз
        if (!head || document.querySelector('.head__refresh')) return;

        const btn = document.createElement('div');
        btn.className = 'head__refresh selector';
        btn.style.marginLeft = '1rem';
        btn.innerHTML =
            '<svg width="24" height="24" viewBox="0 0 24 24">' +
            '<path d="M17 1l4 4-4 4M3 11a8 8 0 0115 2M7 23l-4-4 4-4m14-2a8 8 0 01-15-2"' +
            ' stroke="currentColor" stroke-width="2" fill="none"/></svg>';

        btn.addEventListener('hover:enter', () => {
            location.reload();
        });

        head.appendChild(btn);
    }

    function init() {
        addButton();
        // чтобы не пропадала при переходах
        Lampa.Listener.follow('app', addButton);
    }

    Lampa.Plugin.create('top-refresh-end', init);
})();
