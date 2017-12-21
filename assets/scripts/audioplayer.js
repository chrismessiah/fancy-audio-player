/*!
 *  MIT License
 */

require('howler');

var rootContainerName = 'audioplayer-rootcontainer';

var playlistTracks = [{
  title: 'Demenspodden',
  subtitle: 'Avsnitt 36: Med hjälp av tekniken',
  file: '/demenspodden.mp3',
  howl: null
}];

var waveSettings = {
    cover: true,
    speed: 0.06,
    amplitude: 0.5,
    frequency: 5
};

var elms = [
  'track',
  'trackSubtitle',
  'timer',
  'duration',
  'playBtn',
  'pauseBtn',
  'volumeBtn',
  'progress',
  'bar',
  'wave',
  'loading',
  'list',
  'volume',
  'barEmpty',
  'barFull',
  'sliderBtn',
  'canvas'
];

module.exports = function() {
  elms.forEach(function(elm) { window[elm] = document.getElementById(elm); });
  var innerWidth = document.getElementById(rootContainerName).offsetWidth;
  var innerHeight = document.getElementById(rootContainerName).offsetHeight;
  waveSettings.container = waveform;
  waveSettings.width = innerWidth;
  waveSettings.height = innerHeight;



  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;
  var BAR_WIDTH_FACTOR = 0.5;
  var BAR_COLOR = null;
  //var BAR_COLOR = {r: 100, g: 100, b: 255};

  var ctx = canvas.getContext("2d");





  var Player = function(playlist) {
    this.playlist = playlist;
    this.index = 0;
    track.innerHTML = playlist[0].title;
    trackSubtitle.innerHTML = playlist[0].subtitle;
  };

  var modulateWave = function(direction) {
    var start = null;
    var progressEnd = 2000;
    var step = function(timestamp) {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      var progressPercentage = progress/progressEnd;

      var newAmplitude = (direction && direction === 'D') ? waveSettings.amplitude - waveSettings.amplitude*progressPercentage : waveSettings.amplitude*progressPercentage;
      wave.setAmplitude(newAmplitude);

      if (progress < progressEnd) {
        window.requestAnimationFrame(step);
      } else {
        if (direction && direction === 'D') {
          wave.container.style.display = 'none';
          bar.style.display = 'block';
        }
      }
    }
    window.requestAnimationFrame(step);
  }

  Player.prototype = {
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    play: function(index) {
      var self = this;
      var sound;

      index = typeof index === 'number' ? index : self.index;
      var data = self.playlist[index];

      // If we already loaded this track, use the current one.
      // Otherwise, setup and load a new Howl.
      if (data.howl) {
        sound = data.howl;
      } else {
        sound = data.howl = new Howl({
          src: [data.file],
          html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
          onplay: function() {
            duration.innerHTML = self.formatTime(Math.round(sound.duration())); // Display the duration.
            requestAnimationFrame(self.step.bind(self)); // Start upating the progress of the track.

            // Start the wave animation if we have already loaded
            wave.container.style.display = 'block';
            bar.style.display = 'none';
            pauseBtn.style.display = 'block';
            console.log(sound.ctx);
            modulateWave();
          },
          onload: function() {
            // Start the wave animation.
            wave.container.style.display = 'block';
            bar.style.display = 'none';
            loading.style.display = 'none';
            modulateWave();
          },
          onend: function() { modulateWave('D'); }, // Stop the wave animation
          onpause: function() { modulateWave('D'); }, // Stop the wave animation
          onstop: function() { modulateWave('D'); } // Stop the wave animation
        });
      }

      // Begin playing the sound.
      sound.play();

      // Update the track display.
      track.innerHTML = data.title;
      trackSubtitle.innerHTML = data.subtitle;

      // Show the pause button.
      if (sound.state() === 'loaded') {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
      } else {
        loading.style.display = 'block';
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
      }

      // Keep track of the index we are currently playing.
      self.index = index;
    },

    /**
     * Pause the currently playing track.
     */
    pause: function() {
      var self = this;

      // Get the Howl we want to manipulate.
      var sound = self.playlist[self.index].howl;

      // Puase the sound.
      sound.pause();

      // Show the play button.
      playBtn.style.display = 'block';
      pauseBtn.style.display = 'none';
    },

    /**
     * Skip to the next or previous track.
     * @param  {String} direction 'next' or 'prev'.
     */
    skip: function(direction) {},
    skipTo: function(index) {},

    /**
     * Set the volume and update the volume slider display.
     * @param  {Number} val Volume between 0 and 1.
     */
    volume: function(val) {
      var self = this;

      // Update the global volume (affecting all Howls).
      Howler.volume(val);

      // Update the display on the slider.
      var fullSlider = 80;
      var barWidth = (val * 90) / fullSlider;
      barFull.style.width = (barWidth * fullSlider) + '%';
      sliderBtn.style.left = (barWidth * fullSlider) + '%';
    },

    /**
     * Seek to a new position in the currently playing track.
     * @param  {Number} per Percentage through the song to skip.
     */
    seek: function(per) {
      var self = this;

      // Get the Howl we want to manipulate.
      var sound = self.playlist[self.index].howl;

      // Convert the percent into a seek position.
      if (sound.playing()) {
        sound.seek(sound.duration() * per);
      }
    },

    /**
     * The step called within requestAnimationFrame to update the playback position.
     */
    step: function() {
      var self = this;

      // Get the Howl we want to manipulate.
      var sound = self.playlist[self.index].howl;

      // Determine our current seek position.
      var seek = sound.seek() || 0;
      timer.innerHTML = self.formatTime(Math.round(seek));
      progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

      // If the sound is still playing, continue stepping.
      if (sound.playing()) {
        requestAnimationFrame(self.step.bind(self));
      }
    },

    togglePlaylist: function() {},
    toggleVolume: function() {
      var self = this;
      var display = (volume.style.display === 'block') ? 'none' : 'block';

      setTimeout(function() {
        volume.style.display = display;
      }, (display === 'block') ? 0 : 500);
      volume.className = (display === 'block') ? 'fadein' : 'fadeout';
    },

    /**
     * Format the time from seconds to M:SS.
     * @param  {Number} secs Seconds to format.
     * @return {String}      Formatted time.
     */
    formatTime: function(secs) {
      var minutes = Math.floor(secs / 60) || 0;
      var seconds = (secs - minutes * 60) || 0;

      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
  };

  // Setup our new audio player class and pass it the playlist.
  var player = new Player(playlistTracks);

  // Bind our player controls.
  playBtn.addEventListener('click', function() { player.play(); });
  pauseBtn.addEventListener('click', function() { player.pause(); });
  volumeBtn.addEventListener('click', function() { player.toggleVolume(); });
  volume.addEventListener('click', function() { player.toggleVolume(); });

  waveform.addEventListener('click', function(event) {
    var offsetLeft = $('#' + rootContainerName).offset().left
    player.seek((event.clientX-offsetLeft) / innerWidth);
  });

  // Setup the event listeners to enable dragging of volume slider.
  barEmpty.addEventListener('click', function(event) {
    var per = event.layerX / parseFloat(barEmpty.scrollWidth);
    player.volume(per);
  });
  sliderBtn.addEventListener('mousedown', function() {
    window.sliderDown = true;
  });
  sliderBtn.addEventListener('touchstart', function() {
    window.sliderDown = true;
  });
  volume.addEventListener('mouseup', function() {
    window.sliderDown = false;
  });
  volume.addEventListener('touchend', function() {
    window.sliderDown = false;
  });

  var move = function(event) {
    if (window.sliderDown) {
      var x = event.clientX || event.touches[0].clientX;
      var startX = innerWidth * 0.05;
      var layerX = x - startX;
      var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
      player.volume(per);
    }
  };

  volume.addEventListener('mousemove', move);
  volume.addEventListener('touchmove', move);

  // Setup the "waveform" animation.
  var wave = new SiriWave(waveSettings);
  wave.start();

  // Update the height of the wave animation.
  // These are basically some hacks to get SiriWave.js to do what we want.
  var resize = function() {
    var height = innerHeight;
    var width = document.getElementById(rootContainerName).offsetWidth;
    wave.height = height;
    wave.height_2 = height / 2;
    wave.MAX = wave.height_2 - 4;
    wave.width = width;
    wave.width_2 = width / 2;
    wave.width_4 = width / 4;
    wave.canvas.height = height;
    wave.canvas.width = width;
    //wave.container.style.margin = -(height / 2) + 'px auto';

    // Update the position of the slider.
    var sound = player.playlist[player.index].howl;
    if (sound) {
      var vol = sound.volume();
      var barWidth = (vol * 0.9);
      sliderBtn.style.left = (innerWidth * barWidth + innerWidth * 0.05 - 25) + 'px';
    }
  };
  window.addEventListener('resize', resize);
  resize();

}
