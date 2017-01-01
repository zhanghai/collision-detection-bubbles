/*
 * Copyright (c) 2017 Zhang Hai <dreaming.in.code.zh@gmail.com>
 * All Rights Reserved.
 */

'use strict';

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
    return min + (max - min)
        * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * (1 - Math.random()));
}

class Bubble {

    constructor(options) {

        this.position = options.position;
        this.velocity = options.velocity;
        this.color = options.color;

        this.shape = new Two.Ellipse(0, 0, 1, 1);
        this.updateColor();
    }

    updateShape(scale) {
        this.shape.translation.copy(this.position);
        this.shape.scale = scale;
        this.shape.linewidth = 4 / scale;
    }

    updateColor() {
        this.shape.fill = chroma(this.color).alpha(0.12).css();
        this.shape.stroke = this.color;
    }
}

class Screen {

    constructor(options) {

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

    spawn() {
        const bubble = new Bubble({
            position: new Two.Vector(-this.sizeScale, this.height + this.sizeScale),
            velocity: new Two.Vector(randomNd(0.8, 1), -randomNd(0.8, 1)).normalize()
                .multiplyScalar(randomNd(0.8, 1.2)),
            color: this._randomSpawnColor()
        });
        this._bubbles.push(bubble);
        this._shapes.add(bubble.shape);
    }

    _randomSpawnColor() {
        const colorMap = new Map();
        for (const color of this.colors) {
            colorMap.set(color, 0);
        }
        for (const bubble of this._bubbles) {
            colorMap.set(bubble.color, colorMap.get(bubble.color) + 1);
        }
        const colorEntries = [...colorMap.entries()].sort((entry1, entry2) => entry1[1] - entry2[1]);
        const colors = colorEntries.filter(entry => entry[1] === colorEntries[0][1]).map(entry => entry[0]);
        return colors[randomInteger(colors.length)];
    }

    kill() {
        const index = this._bubbles.length - 1;
        if (index < 0) {
            return;
        }
        const bubble = this._bubbles[index];
        this._bubbles.splice(index, 1);
        this._shapes.remove(bubble.shape);
    }

    update() {
        const now = Date.now();
        let deltaMillis = now - this._lastUpdate;
        while (deltaMillis > this._updateStepMillis) {
            this._updateSingleStep();
            deltaMillis -= this._updateStepMillis;
        }
        for (const bubble of this._bubbles) {
            bubble.updateShape(this.sizeScale);
        }
        this._lastUpdate = now - deltaMillis;
    }

    _updateSingleStep() {

        const updateStepSeconds = this._updateStepMillis / 1000;
        for (const bubble of this._bubbles) {
            bubble.position.x += this.velocityScale * bubble.velocity.x * updateStepSeconds;
            bubble.position.y += this.velocityScale * bubble.velocity.y * updateStepSeconds;
        }

        // Naive collision detection and resolution among bubbles within O(N^2) time.
        for (let i = 0; i < this._bubbles.length - 1; ++i) {
            const bubble1 = this._bubbles[i];
            for (let j = i + 1; j < this._bubbles.length; ++j) {
                const bubble2 = this._bubbles[j];
                if (this._hasCollisionBetween(bubble1, bubble2)) {
                    // Collision resolution assuming same mass, exchanging velocity components.
                    // This requires the use of constant time step size.
                    const line = new Two.Vector().sub(bubble2.position, bubble1.position).normalize();
                    const scalarVelocity1 = bubble1.velocity.dot(line);
                    const scalarVelocity2 = bubble2.velocity.dot(line);
                    if (scalarVelocity1 < scalarVelocity2) {
                        // Already leaving each other, skip.
                        continue;
                    }
                    const velocity1 = new Two.Vector().copy(line).multiplyScalar(scalarVelocity1);
                    const velocity2 = new Two.Vector().copy(line).multiplyScalar(scalarVelocity2);
                    bubble1.velocity.subSelf(velocity1).addSelf(velocity2);
                    bubble2.velocity.subSelf(velocity2).addSelf(velocity1);
                }
            }
        }

        // Naive collision detection and resolution between bubbles and boundaries within O(N) time.
        for (const bubble of this._bubbles) {
            if (bubble.position.x - this.sizeScale < 0) {
                bubble.velocity.x = Math.abs(bubble.velocity.x);
            } else if (bubble.position.x + this.sizeScale > this.width) {
                bubble.velocity.x = -Math.abs(bubble.velocity.x);
            }
            if (bubble.position.y - this.sizeScale < 0) {
                bubble.velocity.y = Math.abs(bubble.velocity.y);
            } else if (bubble.position.y + this.sizeScale > this.height) {
                bubble.velocity.y = -Math.abs(bubble.velocity.y);
            }
        }
    }

    _hasCollisionBetween(position1, position2) {
        if (position1 instanceof Bubble) {
            position1 = position1.position;
        }
        if (position2 instanceof Bubble) {
            position2 = position2.position;
        }
        const distance = Two.Utils.distanceBetween(position1, position2);
        // Allow overlap if too close, useful when size/speed changed.
        const ignoreCollisionDistance = 2 * this.velocityScale * this._updateStepMillis / 1000;
        return distance <= 2 * this.sizeScale && distance > ignoreCollisionDistance;
    }

    setLastUpdateToNow() {
        this._lastUpdate = Date.now();
    }
}

const twoElement = document.getElementById('scene');
const two = new Two({
    width: twoElement.clientWidth,
    height: twoElement.clientHeight,
    autostart: true
}).appendTo(twoElement);

const screenGroup = two.makeGroup();
screenGroup.id = 'screen';

const bubbles = new Screen({
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
        '#e74c3c', // Alizarin
        //'#c0392b', // Pomegranate
        //'#ecf0f1', // Clouds
        //'#bdc3c7', // Silver
        //'#95a5a6', // Concrete
        //'#7f8c8d' // Asbestos
    ]
});

two.bind('update', () => {
    bubbles.update();
});

const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
document.getElementById('play-pause').addEventListener('click', event => {
    two.playing ? two.pause() : two.play();
    if (two.playing) {
        bubbles.setLastUpdateToNow();
    }
    playIcon.classList.toggle('display-none', two.playing);
    pauseIcon.classList.toggle('display-none', !two.playing);
});
document.getElementById('bubble-size').addEventListener('input', event => {
    bubbles.sizeScale = Number.parseFloat(event.target.value);
});
document.getElementById('bubble-speed').addEventListener('input', event => {
    bubbles.velocityScale = Number.parseFloat(event.target.value);
});
document.getElementById('add-bubble').addEventListener('click', event => {
    bubbles.spawn();
});
document.getElementById('remove-bubble').addEventListener('click', event => {
    bubbles.kill();
});

function spawnWithInterval(count, interval) {
    if (count > 0) {
        bubbles.spawn();
        setTimeout(() => spawnWithInterval(count - 1, interval), interval);
    }
}
spawnWithInterval(7, 1000);
