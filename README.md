# hypervideo

## Usage
You will need to include:
 - The JavaScript file `hypervideo.js` (or its minified version `hypervideo.min.js`)
 - The css file `hypervideo.css`

### Install using bower or npm
You can install *hypervideo.js* with *yarn* or *npm* if you prefer:

Terminal:
```shell
// With yarn
yarn add @dmakaridze/hypervideo

// With npm
npm install @dmakaridze/hypervideo
```

### Including files:
```html
<!--suppress ALL -->
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/hypervideo/dist/css/hypervideo.css">

<script src="node_modules/gsap/src/minified/TweenMax.min.js"></script>
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/popper.js/dist/umd/popper.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>

<script type="text/javascript" src="node_modules/hypervideo/dist/js/hypervideo.js"></script>
```

### Required HTML structure

For interactive video story you should create a wrapper (`<div id="hypervideo">` in this case). The wrapper can not be the `body` element.
```html
<div id="hypervideo"></div>
```

### Initialization

#### Initialization with Vanilla Javascript
All you need to do is call hypervideo.js before the closing `</body>` tag.

```javascript
hypervideo_init({
    // options here
    story: 'story.json',
    id: 'hypervideo',
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    verticalAlign: 'center',
    start: 0,
    modalFrameId: null,
    modalTitleId: null,
    mute: false,
    controls: false
});
```
### People
<a href="https://github.com/dmakaridze" target="_blank" rel="nofollow">
	<img src="https://avatars1.githubusercontent.com/u/6157971?s=460&v=4" width="50">
</a>

#