Atom.addEvent(window, "mousemove", function(e) {
    if(Audio.prototype.activePlayer === null)
        return false;
    
    Audio.prototype.eventsHandler.call(Audio.prototype.activePlayer, e);
});

Atom.addEvent(window, "mouseup", function() {
    Audio.prototype.activePlayer = null;
});


class Audio {
    
    constructor(options) {
        if (options === undefined)
            options = {};
        if (options.style === undefined)
            options.style = "defaut";
        if (options.element_dest === undefined)
            options.element_dest = document.getElementsByTagName('body')[0];
        if (options.loop === undefined)
            options.loop = this.NO_LOOP;
        if (options.random === undefined)
            options.random = false;
        if (options.btnStop === undefined)
            options.btnStop = false;
        if (options.btnLoop === undefined)
            options.btnLoop = false;
        if (options.btnRandom === undefined)
            options.btnRandom = false;
        if (options.volume === undefined)
            options.volume = 1;
        if (options.step === undefined)
            options.step = this.DEFAULT_STEP;
        
        this.init(options);
        
        this.volume = options.volume;
    }

    init(options) {
        var e = this;

        this.audio = document.createElement('audio');
        this.interface = document.createElement('div');
        this.menu = document.createElement('div');
        this.progressBar = document.createElement('div');
        this.progressBar_actual = document.createElement('div');
        this.progressBar_buffer = document.createElement('div');
        this.progressBar_cursor = document.createElement('div');
        this.btn_lecture = document.createElement('div');
        this.hitbox_volume = document.createElement('div');
        this.btn_volume = document.createElement('div');
        this.bar_volume = document.createElement('div');
        this.barRemplissage_volume = document.createElement('div');
        this.timer_actual = Atom.divTxt("auto", "0:00");
        this.timer_end = Atom.divTxt("auto", "0:00");
        this.audio.player = this;
        this.interface.player = this;
        this.bar_volume.player = this;
        this.interface.className = "audio " + options.style;
        this.menu.className = "menu";
        this.btn_lecture.className = "btn icon spinner-full geometrics";

        this.options = {
            btnStop: options.btnStop,
            btnLoop: options.btnLoop,
            btnRandom: options.btnRandom,
            loop: options.loop,
            random: options.random,
            step: options.step
        };
        this.mediaList = [];
        // PROGRESS BAR
        this.progressBar.className = "progressBar";
        this.progressBar_actual.className = "progressBar_actual";
        this.progressBar_buffer.className = "progressBar_buffer";
        this.progressBar_cursor.className = "progressBar_cursor";
        // VOLUME
        this.btn_volume.className = "btn icon speaker-high";
        this.hitbox_volume.className = "hitbox_volume";
        this.bar_volume.className = "bar_volume";
        this.barRemplissage_volume.className = "barRemplissage_volume";
        this.hitbox_volume.appendChild(this.btn_volume);
        this.hitbox_volume.appendChild(this.bar_volume);
        this.bar_volume.appendChild(this.barRemplissage_volume);
        // TIMER
        this.timer_actual.className = "timer";
        this.timer_end.className = "timer";
        var timer_slash = Atom.divTxt("20", "/");
        timer_slash.className = "timer slash";
        this.menu.appendChild(Atom.widthSpace(20));
        this.menu.appendChild(this.btn_lecture);
        this.menu.appendChild(this.hitbox_volume);
        this.menu.appendChild(Atom.widthSpace(15));
        this.menu.appendChild(this.timer_actual);
        this.menu.appendChild(timer_slash);
        this.menu.appendChild(this.timer_end);
        this.progressBar.appendChild(this.progressBar_buffer);
        this.progressBar.appendChild(this.progressBar_actual);
        this.progressBar.appendChild(this.progressBar_cursor);
        this.interface.appendChild(this.progressBar);
        this.interface.appendChild(this.menu);
        options.element_dest.appendChild(this.interface);
        /* CUSTOM MENU */
        if (this.options.btnStop)
            this.toggleBtnStop();
        if (this.options.btnLoop)
            this.toggleBtnLoop();
        if (this.options.btnRandom)
            this.toggleBtnRandom();
        /* SET POSITION AND SIZE */
        if (options.x !== undefined) {
            this.interface.style.left = options.x + "px";
            this.interface.style.top = options.y + "px";
            this.interface.style.bottom = "auto";
            this.interface.style.width = options.w + "px";
            this.menu.style.height = options.h + "px";
            this.menu.style.lineHeight = options.h + "px";
        }
        /* EVENTS */
        Atom.addEvent(this.interface, "mousedown", function (e) {
            e.preventDefault();
        });
        Atom.addEvent(this.interface, "click", function (e) {
            e.preventDefault();
        });
        this.btn_lecture.onmousedown = function () {
            if (Atom.hasClass("pause", this))
                e.audio.pause();
            else if (Atom.hasClass("play", this)) {
                e.audio.play();
            }
            else if (Atom.hasClass("reload", this)) {
                e.audio.play();
                this.className = "btn icon pause"; // Redemarrer l'audio n'active pas l'event onplay sous IE
            }
        };
        this.btn_volume.onclick = function () {
            var audio = e.audio;
    
            if (audio.volume !== 0) {
                e.volume = audio.volume;
                audio.volume = 0;
            }
            else
                audio.volume = e.volume;
        };
        this.progressBar.onmousedown = function (e) {
            Audio.prototype.activePlayer = this.parentElement.player;
            Audio.prototype.action = "CHANGE_CURRENT_TIME";
            Audio.prototype.eventsHandler.call(this.player,e);
        };
        this.progressBar.onwheel = function (event) {
            if (Atom.wheelDirection(event) === "UP")
                e.forward();
            else
                e.backward();
        };
        this.timer_actual.onwheel = function (event) {
            if (Atom.wheelDirection(event) === "UP")
                e.forward();
            else
                e.backward();
        };
        this.bar_volume.onmousedown = function (e) {
            Audio.prototype.activePlayer = this.parentElement.parentElement.parentElement.player;
            Audio.prototype.action = "CHANGE_VOLUME";
            Audio.prototype.eventsHandler.call(this.player,e);
        };
        this.hitbox_volume.onwheel = function (event) {
            if (Atom.wheelDirection(event) === "UP")
                e.audio.volume = Atom.clamp(0, e.audio.volume + .1, 1);
            else
                e.audio.volume = Atom.clamp(0, e.audio.volume - .1, 1);
        };
        Atom.addEvent(this.audio, "play", function () {
            this.player.btn_lecture.className = "btn icon pause";
        });
        Atom.addEvent(this.audio, "pause", function () {
            this.player.btn_lecture.className = "btn icon play";
        });
        Atom.addEvent(this.audio, "volumechange", function () {
            this.player.majVolume();
        });
        Atom.addEvent(this.audio, "loadstart", function () {
            this.player.btn_lecture.className = "btn icon spinner-third geometrics";
        });
        Atom.addEvent(this.audio, "canplay", function () {
            var t = Atom.getFormatedTime(this.duration);
            this.player.progressBar.style.display = "block";
            if (this.paused === true)
                this.player.btn_lecture.className = "btn icon play";
            else
                this.player.btn_lecture.className = "btn icon pause";
            if (t.h === 0)
                this.player.timer_end.innerHTML = t.m + ":" + Atom.zerofill(t.s, 2);
            else
                this.player.timer_end.innerHTML = t.h + ":" + Atom.zerofill(t.m, 2) + ":" + Atom.zerofill(t.s, 2);
            this.player.updateCurrentTime();
        });
        Atom.addEvent(this.audio, "timeupdate", function () {
            this.player.updateCurrentTime();
        });
        Atom.addEvent(this.audio, "progress", function () {
            var buf = this.buffered;
            if (buf.length === 1) {
                var buffuredTime = buf.end(0);
                var ratio = buffuredTime / this.player.audio.duration;
                this.player.progressBar_buffer.style.width = ratio * this.player.progressBar.offsetWidth + "px";
            }
            else
                this.player.progressBar_buffer.style.width = "0";
        });
        Atom.addEvent(this.audio, "ended", function () {
            if (e.options.loop === e.NO_LOOP) {
                e.btn_lecture.className = "btn icon reload";
            }
            else if (e.options.loop === e.LOOP) {
                e.audio.play();
            }
            else if (e.options.loop === e.LOOP_UNIQUE) {
                e.audio.play();
            }
        });
        this.audio.addEventListener('error', function () {
            var error = e.audio.error;

            if(error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)
                e.error();
        });
    }

    loadMedia(media) {
        if (typeof (media) === "string") // Est une URL
            this.audio.src = media;
        if (window.URL === undefined) // l'objet URL n'est pas géré. IE < 10
            this.trigger_error("Le média ne peux être chargé car votre navigateur n'est pas compatible HTML5. Veuillez mettre a jour votre navigateur pour corriger ce problème.");
        else if (media.type === "file") // Est un input
            this.audio.src = URL.createObjectURL(media.files[0]);
        else if (typeof (media) === "object") { // Est un File
            if (media.constructor.name === "File")
                this.audio.src = URL.createObjectURL(media);
            else
                this.trigger_error("Le média n'a pas été reconnu.");
        }
    }
    
    addToList(media) {
        if (Array.isArray(media))
            mediaList.concat(media);
        else
            mediaList.push(media);
    }

    stop() {
        if (this.audio.readyState === 0)    // Si audio n'est pas prêt
            return false;

        this.btn_lecture.className = "btn icon play";
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    forward() {
        this.audio.currentTime += this.options.step;
    }

    backward() {
        this.audio.currentTime -= this.options.step;
    }

    remove() {
        this.audio.src = "";
        remove(this.interface);
    }
    
    updateCurrentTime() {
        var t = Atom.getFormatedTime(this.audio.currentTime);
        if (t.h === 0)
            this.timer_actual.innerHTML = t.m + ":" + Atom.zerofill(t.s, 2);
        else
            this.timer_actual.innerHTML = t.h + ":" + Atom.zerofill(t.m, 2) + ":" + Atom.zerofill(t.s, 2);
        /* PROGRESS BAR */
        var w = this.progressBar.offsetWidth;
        var ratio = this.audio.currentTime / this.audio.duration;
        var positionX = w * ratio;
        this.progressBar_actual.style.width = positionX + "px";
        this.progressBar_cursor.style.left = positionX + "px";
    }
    
    trigger_error(msg) {
        var evt = new ErrorEvent('error', { message: msg });
        this.audio.dispatchEvent(evt);
    }
    
    majVolume() {
        var volume = this.audio.volume;
        // btn_volume
        if (volume === 1)
            this.btn_volume.className = "btn icon speaker-high";
        else if (volume >= 0.5)
            this.btn_volume.className = "btn icon speaker-medium";
        else if (volume === 0)
            this.btn_volume.className = "btn icon speaker-mute";
        else
            this.btn_volume.className = "btn icon speaker-low";
        // bar_volume
        this.barRemplissage_volume.style.width = (volume * 100) + "%";
    }

    toggleBtnStop() {
        if (this.btn_stop === undefined) {
            this.btn_stop = document.createElement('div');
            this.btn_stop.className = "btn icon stop";

            this.menu.insertBefore(this.btn_stop, this.btn_volume.parentElement);

            this.btn_stop.onclick = function () {
                var player = this.parentElement.parentElement.player;
                player.stop();
            };

            this.btn_stop.style.display = "inline-block";
            return false;
        }

        this.options.btnStop = !this.options.btnStop;
        this.btn_stop.style.display = this.options.btnStop ? "inline-block" : "none";
    }

    toggleBtnLoop() {
        var e = this;
        
        if (this.btn_loop === undefined) {
            this.btn_loop = document.createElement('div');
            this.btn_loop.className = "btn icon";

            if (this.options.loop === this.NO_LOOP) {
                Atom.addClass("loop", this.btn_loop);
                Atom.addClass("disabled", this.btn_loop);
            }
            else if (this.options.loop === this.LOOP) {
                Atom.addClass("loop", this.btn_loop);
            }
            else if (this.options.loop === this.LOOP_UNIQUE) {
                Atom.addClass("loopUnique", this.btn_loop);
            } 

            this.menu.insertBefore(this.btn_loop, this.btn_volume.parentElement);
            
            this.btn_loop.onclick = function () {
                e.toggleLoop();
            };

            this.btn_loop.style.display = "inline-block";
            return false;
        }

        this.options.btnLoop = !this.options.btnLoop;
        this.btn_loop.style.display = this.options.btnLoop ? "inline-block" : "none";
    }
    
    toggleLoop() {
        var opts = this.options;

        opts.loop++;
        if(opts.loop > this.LOOP_UNIQUE)
            opts.loop = this.NO_LOOP;

        if (this.btn_loop === undefined)
            return false;

        var btn = this.btn_loop;

        if (opts.loop === this.NO_LOOP) {
            Atom.addClass("loop", btn);
            Atom.removeClass("loopUnique", btn);
            Atom.addClass("disabled", btn);
        }
        else if (opts.loop === this.LOOP) {
            Atom.addClass("loop", btn);
            Atom.removeClass("loopUnique", btn);
            Atom.removeClass("disabled", btn);
        }
        else if (opts.loop === this.LOOP_UNIQUE) {
            Atom.removeClass("loop", btn);
            Atom.addClass("loopUnique", btn);
            Atom.removeClass("disabled", btn);
        }
    }

    toggleBtnRandom() {
        var e = this;

        if (this.btn_random === undefined) {
            this.btn_random = document.createElement('div');
            this.btn_random.className = "btn icon random";

            if (this.options.random === false)
                Atom.addClass("disabled", this.btn_random);

            this.menu.insertBefore(this.btn_random, this.btn_volume.parentElement);

            this.btn_random.onclick = function () {
                e.toggleRandom();
            };

            this.btn_random.style.display = "inline-block";
            return false;
        }

        this.options.btnRandom = !this.options.btnRandom;
        this.btn_random.style.display = this.options.btnRandom ? "inline-block" : "none";
    }

    toggleRandom() {
        var opts = this.options;
        var btn = this.btn_random;

        opts.random = !opts.random;

        if (opts.random)
            Atom.removeClass("disabled", btn);
        else
            Atom.addClass("disabled", btn);
    }

    error() {
        var btn = this.btn_lecture;

        btn.className = "btn icon warning";
    }

    eventsHandler(e) {
        var action = Audio.prototype.action;
        var activePlayer = Audio.prototype.activePlayer;
    
        if(action === "CHANGE_CURRENT_TIME") {
            var progressBar = activePlayer.progressBar;
            var audio = activePlayer.audio;
            var w = progressBar.offsetWidth;
            var pos = e.clientX - progressBar.getBoundingClientRect().left;
            var ratio = pos/w;
            ratio = Atom.clamp(0, ratio, 1);
            audio.currentTime = ratio*audio.duration;
        }
        else if(action === "CHANGE_VOLUME") {
            var bar_volume = activePlayer.bar_volume;
            var audio = activePlayer.audio;
            var w = bar_volume.offsetWidth;
            var pos = e.clientX - bar_volume.getBoundingClientRect().left;
            var ratio = pos/w;
            ratio = Atom.clamp(0, ratio, 1);
    
            audio.volume = ratio;
            if (ratio > 0)
                this.volume = ratio;    // Conserve le volume dans une variable pour unmute
        }
    }
}

Audio.prototype.NO_LOOP = 0;
Audio.prototype.LOOP = 1;
Audio.prototype.LOOP_UNIQUE = 2;

Audio.prototype.DEFAULT_STEP = 5;
