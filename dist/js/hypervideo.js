/**
 *
 * @param ops
 * @param hyperVideo
 * @param parent
 * @constructor
 */
const Link = function (ops, hyperVideo, parent) {
    this.parent = parent;
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
        auto: false,
        text: ""
    };
    this.hidden = true;
    $.extend(this.ops, ops);
    this.text = (this.ops.text === "") ? null : document.getElementById(this.ops.text);
    if (this.ops.auto) {
        this.shape = null;
        if ((this.ops.out - this.ops.in) < 1) {
            this.ops.out = this.ops.in + 1;
        }
    } else {
        this.shape = true;
        this[0] = document.createElement('div');
        parent[0].appendChild(this[0]);
        this[0].dataset.target = this.ops.target;
        this[0].dataset.target = this.ops.target;
        this[0].classList.add('hyper-video-link', this.ops.class, this.ops.shape);
        const self = this;
        this[0].onclick = function () {
            self.click();
        }
    }
};
/**
 *
 */
Link.prototype.click = function () {
    const hyperVideo = this.parent.parent;
    const player = hyperVideo.video[0];
    if (this.text) {
        hyperVideo.modalBody.innerHTML = this.text.innerHTML;
        hyperVideo.modalTitle.innerHTML = this.text.dataset.title;
        $(hyperVideo.modal).modal();
    } else {
        let target = this.ops.target;
        TweenMax.to([player, hyperVideo.links[0]], 1, {
            opacity: 0,
            onComplete: function () {
                hyperVideo.video[0].currentTime = target;
                hyperVideo.video[0].play();
            }
        });
    }
};
/**
 *
 * @param widthRatio
 * @param heightRatio
 */
Link.prototype.resize = function (widthRatio, heightRatio) {
    if (this.shape) {
        this[0].style.width = ((this.ops.width / widthRatio) * 100) + '%';
        this[0].style.height = ((this.ops.height / heightRatio) * 100) + '%';//this.ops.height + '%';
        this[0].style.left = this.ops.x + '%';
        this[0].style.top = this.ops.y + '%';
    }
};
/**
 *
 */
Link.prototype.show = function () {
    this.hidden = false;
    if (this.ops.auto) {
        this.click();
        return;
    }
    if (this.shape) {
        this[0].classList.add('visible');
    }
};
/**
 *
 */
Link.prototype.hide = function () {
    this.hidden = true;
    if (this.shape) {
        this[0].classList.remove('visible');
    }
};
/**
 *
 * @param parent
 * @constructor
 */
const LinksLayer = function (parent) {
    this[0] = document.createElement('div');
    this[0].classList.add('hyper-video-links-layer');
    this.parent = parent;
    this.parent[0].appendChild(this[0]);
    this.links = [];
};
/**
 *
 * @param links
 */
LinksLayer.prototype.init = function (links) {
    for (let i = 0; i < links.length; i++) {
        this.links[i] = new Link(links[i], this.parent, this);
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
    const heightRatio = 40 / (w / h);
    for (let i = 0; i < this.links.length; i++) {
        this.links[i].resize(40, heightRatio);
    }
};
/**
 *
 * @param t
 */
LinksLayer.prototype.setTime = function (t) {
    for (let i = 0; i < this.links.length; i++) {
        let l = this.links[i];
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
    this[0].muted = parent.settings.muted;
    if (parent.settings.controls) {
        this[0].setAttribute('controls', 'controls');
    }
    this[0].onloadedmetadata = function () {
        TweenMax.to(document.body, 1, {
            opacity: 0,
            onCompleteParams: [parent],
            onComplete: function (hyperVideo) {
                hyperVideo.resize();
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
                    onComplete: function (hyperVideo) {
                        hyperVideo.overlay.style.display = 'none';
                        hyperVideo.video[0].play();
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
                onComplete: function (hyperVideo) {
                    hyperVideo.overlay.style.display = 'none';
                    hyperVideo.video[0].play();
                }
            });
        } else {
            parent.overlay.style.display = 'block';
            TweenMax.to(parent.overlay, 1, {
                opacity: 1,
                onCompleteParams: [parent],
                onComplete: function (hyperVideo) {
                    hyperVideo.video[0].pause();
                }
            });
        }
    };
    this[0].classList.add('hyper-video-player');
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
const HyperVideo = function (options) {
    const hyperVideo = this;
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
        id: 'hyper-video',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        verticalAlign: 'center',
        start: 0,
        controls: false,
        modalFrameId: null,
        modalTitleId: null,
        muted: false
    };
    this.story = {
        title: "no title",
        video: "",
        links: []
    };
    $.extend(this.settings, options);
    this[0] = document.getElementById(this.settings.id);
    if (this[0]) {
        this[0].classList.add('hyper-video-wrapper');
        this.video = new VideoLayer(this);
        this.links = new LinksLayer(this);
        $.getJSON(this.settings.story)
            .done(function (data) {
                hyperVideo.init(data);
            })
            .fail(function (jqxhr, textStatus, error) {
                console.log("Request Failed: " + textStatus + ", " + error);
            });
        this.overlay = document.createElement('DIV');
        this.overlay.classList.add('hyper-video-overlay');
        this.playBtn = document.createElement('DIV');
        this.playBtn.classList.add('hyper-video-play-btn');
        this.overlay.appendChild(this.playBtn);
        document.body.appendChild(this.overlay);
    }
    this.modal = null;
    this.modalTitle = null;
    if (this.settings.modalFrameId) {
        this.modal = document.getElementById(this.settings.modalFrameId);
        if (this.modal && this.settings.modalTitleId) {
            this.modalTitle = document.getElementById(this.settings.modalTitleId);
        }
        this.modalBody = this.modal.getElementsByClassName('modal-body')[0];
        $(this.modal).on('show.bs.modal', function () {
            hyperVideo.video[0].pause();
        });
        $(this.modal).on('hide.bs.modal', function () {
            hyperVideo.video[0].play();
        });
    }
    this.events = {
        rendered: new CustomEvent('hyperVideo.rendered'),
        initiated: new CustomEvent('hyperVideo.initiated'),
        resize: new CustomEvent('hyperVideo.resize')
    };
    this[0].dispatchEvent(this.events.rendered);
};
/**
 *
 * @param data
 */
HyperVideo.prototype.init = function (data) {
    $.extend(this.story, data);
    if (this.settings.start === 0 && typeof this.story.start !== 'undefined') {
        this.settings.start = this.story.start;
    }
    this.video.setSrc(this.story.video);
    this.links.init(this.story.links, this.video);
    this[0].dispatchEvent(this.events.initiated);
};
/**
 *
 */
HyperVideo.prototype.resize = function () {
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
    this[0].dispatchEvent(this.events.resize);
};
/**
 *
 * @param t
 */
HyperVideo.prototype.setTime = function (t) {
    this.time = t;
    this.links.setTime(t);
};
/**
 *
 * @param options
 */
const hyper_video_init = function (options) {
    if (typeof options.story === "string" && options.story !== '') {
        const hyperVideo = new HyperVideo(options);
        window.onresize = function () {
            TweenMax.to(document.body, 1, {
                opacity: 0,
                onComplete: function () {
                    hyperVideo.resize();
                }
            });
        };
        return hyperVideo;
    }
    return null;
};
/**
 * End of hypervideo.js
 */