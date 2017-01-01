/*
 * Copyright (c) 2017 Zhang Hai <dreaming.in.code.zh@gmail.com>
 * All Rights Reserved.
 */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function random(min, max) {
    if (typeof max === 'undefined') {
        max = min || 1;
        min = 0;
    }
    return min + (max - min) * Math.random();
}

function randomInteger(min, max) {
    return Math.floor(random(min, max));
}

function randomNd(min, max) {
    if (typeof max === 'undefined') {
        max = min || 1;
        min = 0;
    }
    return min + (max - min) * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * (1 - Math.random()));
}

var Bubble = function () {
    function Bubble(options) {
        _classCallCheck(this, Bubble);

        this.position = options.position;
        this.velocity = options.velocity;
        this.color = options.color;

        this.shape = new Two.Ellipse(0, 0, 1, 1);
        this.updateColor();
    }

    _createClass(Bubble, [{
        key: 'updateShape',
        value: function updateShape(scale) {
            this.shape.translation.copy(this.position);
            this.shape.scale = scale;
            this.shape.linewidth = 4 / scale;
        }
    }, {
        key: 'updateColor',
        value: function updateColor() {
            this.shape.fill = chroma(this.color).alpha(0.12).css();
            this.shape.stroke = this.color;
        }
    }]);

    return Bubble;
}();

var Screen = function () {
    function Screen(options) {
        _classCallCheck(this, Screen);

        this.width = options.width;
        this.height = options.height;
        this.sizeScale = options.sizeScale;
        this.velocityScale = options.velocityScale;
        this.colors = options.colors;

        this._bubbles = [];
        this._shapes = new Two.Group();
        this._shapes.id = options.id;
        options.group.add(this._shapes);

        this._updateStepMillis = 10;
        this._lastUpdate = Date.now();
    }

    _createClass(Screen, [{
        key: 'spawn',
        value: function spawn() {
            var bubble = new Bubble({
                position: new Two.Vector(-this.sizeScale, this.height + this.sizeScale),
                velocity: new Two.Vector(randomNd(0.8, 1), -randomNd(0.8, 1)).normalize().multiplyScalar(randomNd(0.8, 1.2)),
                color: this._randomSpawnColor()
            });
            this._bubbles.push(bubble);
            this._shapes.add(bubble.shape);
        }
    }, {
        key: '_randomSpawnColor',
        value: function _randomSpawnColor() {
            var colorMap = new Map();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.colors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var color = _step.value;

                    colorMap.set(color, 0);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._bubbles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var bubble = _step2.value;

                    colorMap.set(bubble.color, colorMap.get(bubble.color) + 1);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var colorEntries = [].concat(_toConsumableArray(colorMap.entries())).sort(function (entry1, entry2) {
                return entry1[1] - entry2[1];
            });
            var colors = colorEntries.filter(function (entry) {
                return entry[1] === colorEntries[0][1];
            }).map(function (entry) {
                return entry[0];
            });
            return colors[randomInteger(colors.length)];
        }
    }, {
        key: 'kill',
        value: function kill() {
            var index = this._bubbles.length - 1;
            if (index < 0) {
                return;
            }
            var bubble = this._bubbles[index];
            this._bubbles.splice(index, 1);
            this._shapes.remove(bubble.shape);
        }
    }, {
        key: 'update',
        value: function update() {
            var now = Date.now();
            var deltaMillis = now - this._lastUpdate;
            while (deltaMillis > this._updateStepMillis) {
                this._updateSingleStep();
                deltaMillis -= this._updateStepMillis;
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._bubbles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var bubble = _step3.value;

                    bubble.updateShape(this.sizeScale);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            this._lastUpdate = now - deltaMillis;
        }
    }, {
        key: '_updateSingleStep',
        value: function _updateSingleStep() {

            var updateStepSeconds = this._updateStepMillis / 1000;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._bubbles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var bubble = _step4.value;

                    bubble.position.x += this.velocityScale * bubble.velocity.x * updateStepSeconds;
                    bubble.position.y += this.velocityScale * bubble.velocity.y * updateStepSeconds;
                }

                // Naive collision detection and resolution among bubbles within O(N^2) time.
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            for (var i = 0; i < this._bubbles.length - 1; ++i) {
                var bubble1 = this._bubbles[i];
                for (var j = i + 1; j < this._bubbles.length; ++j) {
                    var bubble2 = this._bubbles[j];
                    if (this._hasCollisionBetween(bubble1, bubble2)) {
                        // Collision resolution assuming same mass, exchanging velocity components.
                        // This requires the use of constant time step size.
                        var line = new Two.Vector().sub(bubble2.position, bubble1.position).normalize();
                        var scalarVelocity1 = bubble1.velocity.dot(line);
                        var scalarVelocity2 = bubble2.velocity.dot(line);
                        if (scalarVelocity1 < scalarVelocity2) {
                            // Already leaving each other, skip.
                            continue;
                        }
                        var velocity1 = new Two.Vector().copy(line).multiplyScalar(scalarVelocity1);
                        var velocity2 = new Two.Vector().copy(line).multiplyScalar(scalarVelocity2);
                        bubble1.velocity.subSelf(velocity1).addSelf(velocity2);
                        bubble2.velocity.subSelf(velocity2).addSelf(velocity1);
                    }
                }
            }

            // Naive collision detection and resolution between bubbles and boundaries within O(N) time.
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this._bubbles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _bubble = _step5.value;

                    if (_bubble.position.x - this.sizeScale < 0) {
                        _bubble.velocity.x = Math.abs(_bubble.velocity.x);
                    } else if (_bubble.position.x + this.sizeScale > this.width) {
                        _bubble.velocity.x = -Math.abs(_bubble.velocity.x);
                    }
                    if (_bubble.position.y - this.sizeScale < 0) {
                        _bubble.velocity.y = Math.abs(_bubble.velocity.y);
                    } else if (_bubble.position.y + this.sizeScale > this.height) {
                        _bubble.velocity.y = -Math.abs(_bubble.velocity.y);
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: '_hasCollisionBetween',
        value: function _hasCollisionBetween(position1, position2) {
            if (position1 instanceof Bubble) {
                position1 = position1.position;
            }
            if (position2 instanceof Bubble) {
                position2 = position2.position;
            }
            var distance = Two.Utils.distanceBetween(position1, position2);
            // Allow overlap if too close, useful when size/speed changed.
            var ignoreCollisionDistance = 2 * this.velocityScale * this._updateStepMillis / 1000;
            return distance <= 2 * this.sizeScale && distance > ignoreCollisionDistance;
        }
    }, {
        key: 'setLastUpdateToNow',
        value: function setLastUpdateToNow() {
            this._lastUpdate = Date.now();
        }
    }]);

    return Screen;
}();

var twoElement = document.getElementById('scene');
var two = new Two({
    width: twoElement.clientWidth,
    height: twoElement.clientHeight,
    autostart: true
}).appendTo(twoElement);

var screenGroup = two.makeGroup();
screenGroup.id = 'screen';

var bubbles = new Screen({
    group: screenGroup,
    id: 'bubbles',
    width: two.width / screenGroup.scale,
    height: two.height / screenGroup.scale,
    sizeScale: 100,
    velocityScale: 100,
    colors: [
    // Flat UI colors
    '#1abc9c', // Turquoise
    //'#16a085', // Green sea
    '#2ecc71', // Emerald
    //'#27ae60', // Nephritis
    '#3498db', // Peter river
    //'#2980b9', // Belize hole
    '#9b59b6', // Amethyst
    //'#8e44ad', // Wisteria
    //'#34495e', // Wet asphalt
    //'#2c3e50', // Midnight blue
    '#f1c40f', // Sunflower
    //'#f39c12', // Orange
    '#e67e22', // Carrot
    //'#d35400', // Pumpkin
    '#e74c3c']
});

two.bind('update', function () {
    bubbles.update();
});

var playIcon = document.getElementById('play-icon');
var pauseIcon = document.getElementById('pause-icon');
document.getElementById('play-pause').addEventListener('click', function (event) {
    two.playing ? two.pause() : two.play();
    if (two.playing) {
        bubbles.setLastUpdateToNow();
    }
    playIcon.classList.toggle('display-none', two.playing);
    pauseIcon.classList.toggle('display-none', !two.playing);
});
document.getElementById('bubble-size').addEventListener('input', function (event) {
    bubbles.sizeScale = Number.parseFloat(event.target.value);
});
document.getElementById('bubble-speed').addEventListener('input', function (event) {
    bubbles.velocityScale = Number.parseFloat(event.target.value);
});
document.getElementById('add-bubble').addEventListener('click', function (event) {
    bubbles.spawn();
});
document.getElementById('remove-bubble').addEventListener('click', function (event) {
    bubbles.kill();
});

function spawnWithInterval(count, interval) {
    if (count > 0) {
        bubbles.spawn();
        setTimeout(function () {
            return spawnWithInterval(count - 1, interval);
        }, interval);
    }
}
spawnWithInterval(7, 1000);