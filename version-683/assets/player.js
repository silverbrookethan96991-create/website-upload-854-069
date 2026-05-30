function setupMoviePlayer(url) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var button = document.querySelector('[data-player-button]');
  var started = false;

  if (!video) {
    return;
  }

  function begin() {
    if (started) {
      if (video.paused) {
        video.play().catch(function () {});
      }
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      begin();
    });
  }

  video.addEventListener('click', function () {
    if (!started) {
      begin();
    }
  });
}
