/**
 *
 * @param ops
 * @param hypervideo
 * @param draw
 * @constructor
 */
const Link = function (ops, hypervideo, draw) {
    this.parent = hypervideo;
    this.ops = {
        id: null,
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        shape: "rectangle",
        in: 0,
        out: 0,
        class: "invisible",
        target: 0,
        auto: 0,
        text: ""
    };
    this.hidden = true;
    jQuery.extend(this.ops, ops);
    this.text = (this.ops.text === "") ? null : document.getElementById(this.ops.text);
    if (this.ops.auto) {
        this.shape = null;
        if ((this.ops.out - this.ops.in) < 1) {
            this.ops.out = this.ops.in + 1;
        }
    } else {
        switch (this.ops.shape) {
            case 'rectangle':
                this.shape = draw.rect(this.ops.width, this.ops.height);
                break;
            case 'circle':
                this.shape = draw.circle(this.ops.width);
                break;
            case 'none':
                this.shape = null;
                break;
            default:
                this.shape = draw.ellipse(this.ops.width, this.ops.height);
        }
        if (this.shape) {
            this[0] = this.shape.node;
            this[0].dataset.target = this.ops.target;
            this[0].classList.add('hypervideo-link', ops.class);
            var self = this;
            this[0].onclick = function () {
                this.style.display = 'none';
                self.click();
            }
        }
    }
};
/**
 *
 */
Link.prototype.click = function () {
    var hypervideo = this.parent;
    var player = hypervideo.video[0];
    if (this.text){
        hypervideo.modalBody.innerHTML = this.text.innerHTML;
        hypervideo.modalTitle.innerHTML = this.text.dataset.title;
        $(hypervideo.modal).modal();
    } else {
        var target = this.ops.target;
        TweenMax.to([player, hypervideo.links[0]], 1, {
            opacity: 0,
            onComplete: function () {
                hypervideo.video[0].currentTime = target;
                hypervideo.video[0].play();
            }
        });
    }
};
/**
 *
 * @param w
 * @param h
 * @param scale
 */
Link.prototype.resize = function (w, h, scale) {
    if (this.shape) {
        if (this.ops.shape !== 'none'){
            this.x = this.ops.x * scale;
            this.y = this.ops.y * scale;
            this.width = this.ops.width * scale;
            this.height = this.ops.height * scale;
            this.shape.width(this.width);
            this.shape.height(this.height);
            if (this.ops.shape === 'rectangle'){
                this.shape.move(this.x - this.width / 2, this.y - this.height / 2);
            } else {
                this.shape.center(this.x, this.y);
            }
        }
    }
};
/**
 *
 */
Link.prototype.show = function () {
    this.hidden = false;
    if (this.ops.auto === 1) {
        this.click();
        return;
    }
    if (this.shape) {
        this[0].style.display = 'block';
    }
};
/**
 *
 */
Link.prototype.hide = function () {
    this.hidden = true;
    if (this.shape) {
        this[0].style.display = 'none';
    }
};
/**
 *
 * @param parent
 * @constructor
 */
const LinksLayer = function (parent) {
    this[0] = document.createElement('div');
    this[0].classList.add('hypervideo-links-layer');
    this.parent = parent;
    this.parent[0].appendChild(this[0]);
    this.links = [];
    this.draw = SVG(this[0]);
};
/**
 *
 * @param links
 */
LinksLayer.prototype.init = function (links) {
    for (var i = 0; i < links.length; i++) {
        this.links[i] = new Link(links[i], this.parent, this.draw);
    }
};
/**
 *
 * @param w
 * @param h
 */
LinksLayer.prototype.resize = function (w, h) {
    this[0].style.width = w + 'px';
    this[0].style.height = h + 'px';
    for (var i = 0; i < this.links.length; i++) {
        this.links[i].resize(w, h, this.parent.scale);
    }
};
/**
 *
 * @param t
 */
LinksLayer.prototype.setTime = function (t) {
    for (var i = 0; i < this.links.length; i++) {
        var l = this.links[i];
        if (l.ops.in < t && l.ops.out > t && l.hidden) {
            l.show();
        } else if ((l.ops.in > t || l.ops.out < t) && !l.hidden) {
            l.hide();
        }
    }
};
/**
 *
 * @param parent
 * @constructor
 */
const VideoLayer = function (parent) {
    this[0] = document.createElement('video');
    if (parent.settings.controls){
        this[0].setAttribute('controls', 'controls');
    }
    this[0].onloadedmetadata = function () {
        TweenMax.to(document.body, 1, {
            opacity: 0,
            onCompleteParams: [parent],
            onComplete: function (hypervideo) {
                hypervideo.resize();
            }
        });
    };
    this[0].oncanplaythrough = function () {
        if (!parent.started) {
            parent.started = true;
            parent.video[0].currentTime = parent.settings.start;
            parent.playBtn.onclick = function () {
                TweenMax.to(parent.overlay, 1, {
                    opacity: 0,
                    onCompleteParams: [parent],
                    onComplete: function (hypervideo) {
                        hypervideo.overlay.style.display = 'none';
                        hypervideo.video[0].play();
                    }
                });
            }
        }
    };
    this[0].onplaying = function () {
        TweenMax.to([this, parent.links[0]], 1, {opacity: 1});
    };
    this[0].ontimeupdate = function () {
        parent.setTime(this.currentTime);
    };
    this[0].onclick = function () {
        if (this.paused) {
            TweenMax.to(parent.overlay, 1, {
                opacity: 0,
                onCompleteParams: [parent],
                onComplete: function (hypervideo) {
                    hypervideo.overlay.style.display = 'none';
                    hypervideo.video[0].play();
                }
            });
        } else {
            parent.overlay.style.display = 'block';
            TweenMax.to(parent.overlay, 1, {
                opacity: 1,
                onCompleteParams: [parent],
                onComplete: function (hypervideo) {
                    hypervideo.video[0].pause();
                }
            });
        }
    };
    this[0].classList.add('hypervideo-player');
    this.parent = parent;
    this.parent[0].appendChild(this[0]);
};
/**
 *
 * @param src
 */
VideoLayer.prototype.setSrc = function (src) {
    this[0].src = src;
};
/**
 *
 * @param options
 * @constructor
 */
const Hypervideo = function (options) {
    this.started = false;
    this.time = 0;
    if (typeof options === 'string') {
        options = {
            id: options
        }
    } else if (typeof options !== 'object') {
        options = [];
    }
    this.settings = {
        id: 'hypervideo',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        verticalAlign: 'center',
        start: 0,
        controls: false,
        modalFrameId: null,
        modalTitleId: null
    };
    this.story = {
        title: "no title",
        video: "",
        links: []
    };
    $.extend(this.settings, options);
    this[0] = document.getElementById(this.settings.id);
    if (this[0]) {
        this[0].classList.add('hypervideo-wrapper');
        this.video = new VideoLayer(this);
        this.links = new LinksLayer(this);
        const hypervideo = this;
        $.getJSON(this.settings.story)
            .done(function (data) {
                hypervideo.init(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            });
        this.overlay = document.createElement('DIV');
        this.overlay.style.width = '100vw';
        this.overlay.style.height = '100vh';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.opacity = '0.8';
        this.overlay.style.backgroundColor = '#000';
        this.playBtn = document.createElement('DIV');
        this.playBtn.classList.add('hypervideo-play-btn');
        this.overlay.appendChild(this.playBtn);
        document.body.appendChild(this.overlay);
    }
    this.modal = null;
    this.modalTitle = null;
    if (this.settings.modalFrameId){
        this.modal = document.getElementById(this.settings.modalFrameId);
        if (this.modal && this.settings.modalTitleId){
            this.modalTitle = document.getElementById(this.settings.modalTitleId);
        }
        this.modalBody = this.modal.getElementsByClassName('modal-body')[0];
        $(this.modal).on('show.bs.modal', function () {
            hypervideo.video[0].pause();
        });
        $(this.modal).on('hide.bs.modal', function () {
            hypervideo.video[0].play();
        });
    }
    this.events = {
        created: new CustomEvent('hypervideo.created'),
        loaded: new CustomEvent('hypervideo.loaded'),
        resized: new CustomEvent('hypervideo.resized')
    };
    this[0].dispatchEvent(this.events.created);
};
/**
 *
 * @param data
 */
Hypervideo.prototype.init = function (data) {
    jQuery.extend(this.story, data);
    this.video.setSrc(this.story.video);
    this.links.init(this.story.links, this.video);
    this[0].dispatchEvent(this.events.loaded);
};
/**
 *
 */
Hypervideo.prototype.resize = function () {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.videoWidth = this.video[0].videoWidth;
    this.videoHeight = this.video[0].videoHeight;
    const aspect = this.videoWidth / this.videoHeight;
    if (vw / vh < aspect) {
        this.width = vw;
        this.height = vw / aspect;
    } else {
        this.height = vh;
        this.width = vh * aspect;
    }
    this.scale = this.width / this.videoWidth;
    this.links.resize(this.width, this.height);
    const h = this.playBtn.clientHeight;
    const top = (window.innerHeight - this.height) / 2;
    const left = (window.innerWidth - this.width) / 2;
    this.playBtn.style.top = (this.height - h) / 2 + top + 'px';
    this.playBtn.style.left = (this.width - h) / 2 + left + 'px';
    this[0].style.height = this.height + 'px';
    this[0].style.width = this.width + 'px';
    this[0].style.top = top + 'px';
    this[0].style.left = left + 'px';
    TweenMax.to(document.body, 1, {opacity: 1});
    this[0].dispatchEvent(this.events.resized);
};
/**
 *
 * @param t
 */
Hypervideo.prototype.setTime = function (t) {
    this.time = t;
    this.links.setTime(t);
};
/**
 *
 * @param options
 */
const hypervideo_init = function (options) {
    if (typeof options.story === "string" && options.story !== '') {
        var hypervideo = new Hypervideo(options);
        window.onresize = function () {
            TweenMax.to(document.body, 1, {
                opacity: 0,
                onComplete: function () {
                    hypervideo.resize();
                }
            });
        };
    }
    return hypervideo;
};