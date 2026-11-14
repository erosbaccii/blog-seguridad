// Se carga en el <head> antes de pintar la página (sin defer) para aplicar el tema guardado
// sin parpadeo. Es un archivo aparte (no inline) para respetar la Content-Security-Policy.
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var t = localStorage.getItem('tema');
    if (t === 'light' || t === 'dark') d.dataset.theme = t;
    if (localStorage.getItem('nav-colapsada') === '1') d.dataset.navCollapsed = 'true';
  } catch (e) {}
})();
