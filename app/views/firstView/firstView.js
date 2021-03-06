'use strict';

angular.module('Player.first', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/first', {
                templateUrl: './views/firstView/firstView.html',
                controller: 'FirstViewCtrl'
            })
    }])


    .controller('FirstViewCtrl', ['$scope', '$location',
        function($scope, $location) {

            $scope.sound = null;
            $scope.songPlaying = false;
            $scope.playListVisible = false;
            $scope.timer = "0.00";
            $scope.trackName = "";
            $scope.loop = false;
            $scope.songsList = [];
            $scope.volume = 0.8;
            $scope.playList;
            $scope.shuffle = false;
            var songsArrayForPlaying = [];

            const ipc = require('electron').ipcRenderer;

            $scope.showPlaylist = function() {
                if ($scope.playListVisible) {
                    $scope.playListVisible = false;
                } else {
                    $scope.playListVisible = true;
                }
            }

            $scope.seekToTime = function($event) {
                $scope.player.seek($event.clientX / window.innerWidth);
            }

            $scope.playPlaylistSong = function(index) {
                $scope.player.skipTo(index);
            }

            $scope.nextSound = function() {
                $scope.player.skip('next');
                $scope.songPlaying = true;
            }

            $scope.prevSound = function() {
                $scope.player.skip('prev');
                $scope.songPlaying = true;
            }

            $scope.playPause = function() {
                if ($scope.player) {
                    if ($scope.songPlaying) {
                        $scope.songPlaying = false;
                        $scope.player.pause();
                    } else {
                        $scope.songPlaying = true;
                        $scope.player.play();
                    }
                } else {
                    alert("Add files to play");
                }
            }

            $scope.showVolume = function() {
                $scope.player.toggleVolume();
            }

            $scope.setVolume = function(event) {
                var per = event.screenX / parseFloat(barEmpty.scrollWidth);
                $scope.volume = per;
                $scope.player.volume(per);
            }

            $scope.setLoop = function() {
                $scope.loop = !$scope.loop;
            }

            $scope.playlistShuffle = function() {
                $scope.shuffle = !$scope.shuffle;
                $scope.player.shuffle();
            }

            /* Slider Code */

            var sliderBtn = document.getElementById("sliderBtn");
            var volume = document.getElementById("volume");

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
                    var startX = window.innerWidth * 0.05;
                    var layerX = x - startX;
                    var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
                    $scope.volume = per;
                    $scope.player.volume(per);
                }
            };

            volume.addEventListener('mousemove', move);
            volume.addEventListener('touchmove', move);

            /* Initialize Player */
            var Player = function(playlist) {
                this.playlist = playlist;
                this.index = 0;
            };

            // $("#list").sortable({}).disableSelection();

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
                    $scope.trackName = data.name;
                    // If we already loaded this track, use the current one.
                    // Otherwise, setup and load a new Howl.
                    if (data.howl) {
                        sound = data.howl;
                    } else {
                        sound = data.howl = new Howl({
                            src: [data.file],
                            html5: true,
                            loop: true,
                            volume: $scope.volume,
                            onplay: function() {
                                // Display the duration.
                                // duration.innerHTML = self.formatTime(Math.round(sound.duration()));
                                $scope.timer = self.formatTime(Math.round(sound.duration()));
                                requestAnimationFrame(self.step.bind(self));
                                $scope.$apply();
                            },
                            onend: function() {
                                // Stop the wave animation.
                                if (!$scope.loop) {
                                    self.skip('right');
                                }
                            }
                        });
                    }

                    // Begin playing the sound.
                    try {
                    sound.play();
                    $scope.songPlaying = true;
                    } catch (e) {
                      // console.log(e);
                    }



                    // Keep track of the index we are currently playing.
                    self.index = index;
                },

                /**
                 * Pause the currently playing track.
                 */
                pause: function() {

                    // $scope.songPlaying = !$scope.songPlaying;

                    var self = this;

                    // Get the Howl we want to manipulate.
                    var sound = self.playlist[self.index].howl;

                    // Pause the sound.
                    sound.pause();
                },

                /**
                 * Skip to the next or previous track.
                 * @param  {String} direction 'next' or 'prev'.
                 */
                skip: function(direction) {
                    var self = this;

                    // Get the next track based on the direction of the track.
                    var index = 0;
                    if (direction === 'prev') {
                        index = self.index - 1;
                        if (index < 0) {
                            index = self.playlist.length - 1;
                        }
                    } else {
                        index = self.index + 1;
                        if (index >= self.playlist.length) {
                            index = 0;
                        }
                    }
                    self.skipTo(index);
                },

                /**
                 * Skip to a specific track based on its playlist index.
                 * @param  {Number} index Index in the playlist.
                 */
                skipTo: function(index) {
                    var self = this;

                    // Stop the current track.
                    if (self.playlist[self.index].howl) {
                        self.playlist[self.index].howl.stop();
                    }

                    // Play the new track.
                    self.play(index);
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

                formatTime: function(secs) {
                    var minutes = Math.floor(secs / 60) || 0;
                    var seconds = (secs - minutes * 60) || 0;
                    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
                },

                /**
                 * Seek to a new position in the currently playing track.
                 * @param  {Number} per Percentage through the song to skip.
                 */
                seek: function(time) {
                    var self = this;

                    // Get the Howl we want to manipulate.
                    var sound = self.playlist[self.index].howl;

                    // Convert the percent into a seek position.
                    if (sound.playing()) {
                        sound.seek(sound.duration() * time);
                    }
                },
                /**
                 * Toggle the volume display on/off.
                 */
                toggleVolume: function() {
                    var self = this;
                    var display = (volume.style.display === 'block') ? 'none' : 'block';

                    setTimeout(function() {
                        volume.style.display = display;
                    }, (display === 'block') ? 0 : 500);
                    volume.className = (display === 'block') ? 'fadein' : 'fadeout';
                },

                /**
                 * Set the volume and update the volume slider display.
                 * @param  {Number} val Volume between 0 and 1.
                 */
                volume: function(val) {
                    var self = this;

                    // Get the Howl we want to manipulate.
                    var sound = self.playlist[self.index].howl;

                    // Update the volume to the new value.
                    sound.volume(val);

                    // Update the display on the slider.
                    var barWidth = (val * 90) / 100;
                    barFull.style.width = (barWidth * 100) + '%';
                    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
                },

                playLoop: function() {
                    var self = this;
                    var sound = self.playlist[self.index].howl;
                    sound.loop(true);
                },

                shuffle: function() {
                    var self = this;
                    var playlist = $scope.shuffleArr(self.playlist, self.index);
                    // console.log(playlist);
                    self.playlist = playlist;
                }
            }

            ipc.on('modal-next-song', function(event, arg) {
                $scope.nextSound();
            });

            ipc.on('modal-prev-song', function(event, arg) {
                $scope.prevSound();
            });

            ipc.on('modal-pause-song', function(event, arg) {
                $scope.playPause();
            });

            ipc.on('modal-folder-content', function(event, arg) {
                var message = `Asynchronous message reply: ${arg}`;
                // console.log(arg.path);
                $scope.songsList = arg.files;
                $scope.$apply();
                for (var i = 0; i < $scope.songsList.length; i++) {
                    if ($scope.songsList[i] === " ") {
                        songsArrayForPlaying.push({
                            title: arg.path[i],
                            file: arg.path[i],
                            howl: null,
                            name: arg.path[i].substring(arg.path[i].lastIndexOf("\\")+1,arg.path[i].length)
                        });
                    } else {
                        songsArrayForPlaying.push({
                            title: arg.path + '/' + $scope.songsList[i],
                            file: arg.path + '/' + $scope.songsList[i],
                            howl: null,
                            name: $scope.songsList[i]
                        });
                    }
                }
                $scope.player = new Player(songsArrayForPlaying);
                if (!$scope.wave) {
                    $scope.wave = new SiriWave({
                        container: waveform,
                        width: window.innerWidth,
                        height: window.innerHeight * 0.3,
                        cover: true,
                        speed: 0.03,
                        amplitude: 0.9,
                        frequency: 2
                    });
                }
                $scope.wave.start();
                $scope.$apply();
                // $("#list").sortable({}).disableSelection();
            });

            $scope.shuffleArr = function(arr, fixedPoint) {
                for (var i = arr.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    if (i !== fixedPoint && j !== fixedPoint) {
                        var temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
                return arr;
            }
        }
    ]);
