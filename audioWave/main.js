var audioCtx,
    analyser,
    bufferLength,
    dataArray,
    stream = document.getElementById('src-vid'),
    div = document.querySelector('.animationBarContainer');

function setup() {
    audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    // create context
    source = audioCtx.createMediaElementSource(stream);
    // to analyser
    source.connect(analyser);
    analyser.fftSize = getPowerOf2Val(window.innerWidth) / 2;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    // create columns
    for (let i = 0; i < bufferLength; i++) {
        let column = document.createElement('span');
        div.appendChild(column);
    }
}

function getPowerOf2Val(val) {
    return Math.pow(2, Math.round(Math.log(val) / Math.log(2)));
}

function loop() {
    requestAnimationFrame(loop);
    analyser.getByteTimeDomainData(dataArray);
    //console.log(dataArray);
    var columns = Array.prototype.slice.call(div.querySelectorAll('span'));
    columns.forEach(function(item, index) {
        item.setAttribute('style', 'height:' + dataArray[index] + 'px;');
    });
}

function init() {
    setup();
    loop();
    // to speakers
    analyser.connect(audioCtx.destination);
}

stream.addEventListener('loadeddata', init(), false);
