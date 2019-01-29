/*** LECTEUR AUDIO ***/

function audio(style, element_dest, options) {
    if(style === undefined)
        style = "defaut";
    if(element_dest === undefined)
        element_dest = document.getElementsByTagName('body')[0];
    

    /* INITIALISATION */
    this.audio = document.createElement('audio');
    this.interface = document.createElement('div');
    this.menu = document.createElement('div');
    this.progressBar = document.createElement('div');
    this.progressBar_actual = document.createElement('div');
    this.progressBar_buffer = document.createElement('div');
    this.progressBar_cursor = document.createElement('div');
    this.btn_lecture = document.createElement('div');
    this.btn_stop = document.createElement('div');
    this.hitbox_volume = document.createElement('div');
    this.btn_volume = document.createElement('div');
    this.bar_volume = document.createElement('div');
    this.barRemplissage_volume = document.createElement('div');
    this.timer_actual = divTxt("auto", "0:00");
    this.timer_end = divTxt("auto", "0:00");

    this.audio.lecteur = this;
    this.interface.lecteur = this;
    this.interface.className = "audio " + style;
    this.menu.className = "menu";
    this.btn_lecture.className = "lecture";    
    this.btn_stop.className = "stop";
    this.mediaList = [];
    // PROGRESS BAR
    this.progressBar.className = "progressBar";
    this.progressBar_actual.className = "progressBar_actual";
    this.progressBar_buffer.className = "progressBar_buffer";
    this.progressBar_cursor.className = "progressBar_cursor";
    // VOLUME
    this.btn_volume.className = "volume-high";
    this.hitbox_volume.className = "hitbox_volume";
    this.bar_volume.className = "bar_volume";
    this.barRemplissage_volume.className = "barRemplissage_volume";
    this.hitbox_volume.appendChild(this.btn_volume);
    this.hitbox_volume.appendChild(this.bar_volume);
    this.bar_volume.appendChild(this.barRemplissage_volume);
    // TIMER
    this.timer_actual.className = "timer";
    this.timer_end.className = "timer";
    var timer_slash = divTxt("34", "/");
    timer_slash.className = "timer";
    
    this.menu.appendChild(widthSpace(20));
    this.menu.appendChild(this.btn_lecture);
    this.menu.appendChild(this.btn_stop);
    this.menu.appendChild(this.hitbox_volume);
    this.menu.appendChild(widthSpace(15));
    this.menu.appendChild(this.timer_actual);
    this.menu.appendChild(timer_slash);
    this.menu.appendChild(this.timer_end);
    this.progressBar.appendChild(this.progressBar_buffer);
    this.progressBar.appendChild(this.progressBar_actual);
    this.progressBar.appendChild(this.progressBar_cursor);
    this.interface.appendChild(this.progressBar);
    this.interface.appendChild(this.menu);

    element_dest.appendChild(this.interface);

    /* SET POSITION AND SIZE */
    if(options !== undefined) {
        this.interface.style.left = options.x + "px";
        this.interface.style.top = options.y + "px";
        this.interface.style.bottom = "auto";
        this.interface.style.width = options.w + "px";
        this.menu.style.height = options.h + "px";
        this.menu.style.lineHeight = options.h + "px";
    }


    /* EVENTS */
    addEvent(this.interface, "mousedown", function(e) {
        e.preventDefault();
    });

    addEvent(this.interface, "click", function(e) {
        e.preventDefault();
    });

    this.btn_lecture.onmousedown = function() {
        var lecteur = this.parentElement.parentElement.lecteur;
        
        if(hasClass("pause", this))
            lecteur.audio.pause();
        else if(hasClass("lecture", this)) {
            lecteur.audio.play();
        }
        else if(hasClass("recommencer", this)) {
            lecteur.audio.play();
            this.className = "pause";       // Redemarrer l'audio n'active pas l'event onplay sous IE
        }
    };

    this.btn_stop.onclick = function() {
        var lecteur = this.parentElement.parentElement.lecteur;
        lecteur.stop();
    };

    this.btn_volume.onclick = function() {
        var audio = this.parentElement.parentElement.parentElement.lecteur.audio;

        if(audio.volume !== 0)
            audio.volume = 0;
        else
            audio.volume = 1;
    };

    this.progressBar.onmousedown = function(e) {
        audio.prototype.lecteurActif = this.parentElement.lecteur;
        audio.prototype.action = "CHANGE_CURRENT_TIME";
        audio_main(e);
    };

    this.bar_volume.onmousedown = function(e) {
        audio.prototype.lecteurActif = this.parentElement.parentElement.parentElement.lecteur;
        audio.prototype.action = "CHANGE_VOLUME";
        audio_main(e);
    };

    addEvent(this.audio, "play", function() {
        this.lecteur.btn_lecture.className = "pause";
    });

    addEvent(this.audio, "pause", function() {
        this.lecteur.btn_lecture.className = "lecture";
    });

    addEvent(this.audio, "volumechange", function() {
        this.lecteur.majVolume();
    });

    addEvent(this.audio, "loadstart", function() {
        this.lecteur.btn_lecture.className = "chargement";
    });

    addEvent(this.audio, "canplay", function() {
        var t = getFormatedTime(this.duration);
        
        this.lecteur.progressBar.style.display = "block";

        if(this.paused === true)
            this.lecteur.btn_lecture.className = "lecture";
        else
            this.lecteur.btn_lecture.className = "pause";

        if(t.h === 0)
            this.lecteur.timer_end.innerHTML = t.m + ":" + zerofill(t.s, 2);
        else
            this.lecteur.timer_end.innerHTML = t.h + ":" + zerofill(t.m, 2) + ":" + zerofill(t.s, 2);
        
        this.lecteur.updateCurrentTime();
    });

    addEvent(this.audio, "timeupdate", function() {
        this.lecteur.updateCurrentTime();
    });

    addEvent(this.audio, "progress", function() {
        var buf = this.buffered;

        if(buf.length === 1) {
            var buffuredTime = buf.end(0);
            var ratio = buffuredTime / this.lecteur.audio.duration;
            this.lecteur.progressBar_buffer.style.width = ratio * this.lecteur.progressBar.offsetWidth + "px";
        }
        else
            this.lecteur.progressBar_buffer.style.width = "0";
    });

    addEvent(this.audio, "ended", function() {
        this.lecteur.btn_lecture.className = "recommencer";
    });

}


/*** MAIN FUNCTION ***/

audio_main = function(e) {
    var action = audio.prototype.action;
    var lecteurActif = audio.prototype.lecteurActif;

    if(action === "CHANGE_CURRENT_TIME") {
        var progressBar = lecteurActif.progressBar;
        var audio = lecteurActif.audio;
        var w = progressBar.offsetWidth;
        var pos = e.clientX - getScreenPositionLeft(progressBar);
        var ratio = pos/w;
        ratio = checkRange(ratio, 0, 1);
        audio.currentTime = ratio*audio.duration;
    }
    else if(action === "CHANGE_VOLUME") {
        var bar_volume = lecteurActif.bar_volume;
        var audio = lecteurActif.audio;
        var w = bar_volume.offsetWidth;
        var pos = e.clientX - getScreenPositionLeft(bar_volume);
        var ratio = pos/w;
        ratio = checkRange(ratio, 0, 1);
        audio.volume = ratio;
    }
}


/*** WINDOW EVENTS ***/
addEvent(window, "mousemove", function(e) {
    if(audio.prototype.lecteurActif === null)
        return false;
    
    audio_main(e);
});

addEvent(window, "mouseup", function() {
    audio.prototype.lecteurActif = null;
});


/*** PROTOTYPE ***/

audio.prototype.lecteurActif = null;
audio.prototype.action = null;


/* FONCTIONS PUBLIQUES */
audio.prototype.stop = function() {
    this.btn_lecture.className = "lecture";

    if(this.audio.readyState !== 0) {                               // Evite les exceptions sous IE lorsqu'aucun media n'est chargé
        this.audio.pause();
        this.audio.currentTime = 0;
    }
}

audio.prototype.loadMedia = function(media) {               // Charge le media (url, input, File)
    if(typeof(media) === "string")                                  // Est une URL
        this.audio.src = media;
    if(window.URL === undefined)                                    // l'objet URL n'est pas géré. IE < 10
        this.trigger_error("Le média ne peux être chargé car votre navigateur n'est pas compatible HTML5. Veuillez mettre a jour votre navigateur pour corriger ce problème.");
    else if(media.type === "file")                                  // Est un input
        this.audio.src = URL.createObjectURL(media.files[0]);
    else if(typeof(media) === "object")                             // Est un File
        if(media.constructor.name === "File")
            this.audio.src = URL.createObjectURL(media);
    else
        this.trigger_error("Le média n'a pas été reconnu.");
}

audio.prototype.addToList = function(media) {
    if(Array.isArray(media))
        mediaList.concat(media);
    else
        mediaList.push(media);
}

audio.prototype.detruire = function() {
    this.audio.src = "";
    remove(this.interface);
}



/* FONCTIONS PRIVEES */
audio.prototype.updateCurrentTime = function() {
    var t = getFormatedTime(this.audio.currentTime);

    if(t.h === 0)
        this.timer_actual.innerHTML = t.m + ":" + zerofill(t.s, 2);
    else
        this.timer_actual.innerHTML = t.h + ":" + zerofill(t.m, 2) + ":" + zerofill(t.s, 2);

    /* PROGRESS BAR */
    var w = this.progressBar.offsetWidth;
    var ratio = this.audio.currentTime / this.audio.duration;
    var positionX = w*ratio;

    this.progressBar_actual.style.width = positionX + "px";
    this.progressBar_cursor.style.left = positionX + "px";
}



audio.prototype.trigger_error = function(msg) {
    var evt = new ErrorEvent('error', {message: msg});
    this.audio.dispatchEvent(evt);
};

audio.prototype.majVolume = function() {
    var volume = this.audio.volume;
    
    // btn_volume
    if(volume === 1)
        this.btn_volume.className = "volume-high";
    else if(volume >= 0.5)
        this.btn_volume.className = "volume-medium";
    else if(volume === 0)
        this.btn_volume.className = "volume-mute";
    else
        this.btn_volume.className = "volume-low";

    // bar_volume
    this.barRemplissage_volume.style.width = (volume*100) + "%";
};