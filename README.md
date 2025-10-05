<div style="max-width: 800px; margin: 20px auto;">
    <iframe 
        id="priceWidget1"
        src="https://psplog.github.io/PriceTracker/widget.html?id=1"
        style="width: 100%; border: none; overflow: hidden;"
        scrolling="no"
        frameborder="0">
    </iframe>
</div>

<script>
window.addEventListener('message', function(e) {
    if (e.data.type === 'resize') {
        document.getElementById('priceWidget1').style.height = e.data.height + 'px';
    }
});
</script>
