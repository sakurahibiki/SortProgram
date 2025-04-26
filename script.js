const container = document.getElementById('array-container');
let array = [];
let threadColorMap = {}; 
let isSorting = false;
let progressBars = {}; 
let speed = 60;

// Color palette for threads
const threadColors = [
    '#ff0000', // Red
    '#ffff00', // Yellow
    '#ffffff', // White
    '#660000', // Dark Red
    '#cccccc', // Light Grey
    '#999999', // Dark Grey
    '#ff6666', // Light Red
    '#ffd700'  // Gold-ish Yellow
];

document.getElementById('speed-slider').addEventListener('input', function() {
  const min = parseInt(this.min);
  const max = parseInt(this.max);
  
    speed = parseInt(this.value);
    inverted = (max - speed) + min;
});

function generateArray(size = 30) {
    array = [];
    threadColorMap = {};
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 300) + 20);
        threadColorMap[i] = -1;
    }
    renderArray();
}

function renderArray(highlight = []) {
    container.innerHTML = '';

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = value + 'px';

        const thread = threadColorMap[index];
        if (highlight.includes(index)) {
            bar.style.backgroundColor = '#ffff00';
            bar.style.color = '#000000';
        } else if (thread !== -1) {
            bar.style.backgroundColor = threadColors[thread % threadColors.length];
            bar.style.color = '#000000';
        } else {
            bar.style.backgroundColor = '#ff0000';
            bar.style.color = '#ffff00';
        }

        const numberLabel = document.createElement('span');
        numberLabel.innerText = value;
        bar.appendChild(numberLabel);
        container.appendChild(bar);
    });
}

function createProgressBars(numThreads) {
    const container = document.getElementById('progress-container');
    container.innerHTML = '';

    for (let i = 0; i < numThreads; i++) {
        const box = document.createElement('div');
        box.classList.add('progress-thread');

        const label = document.createElement('h4');
        label.innerText = `Thread ${i + 1}`;

        const bar = document.createElement('div');
        bar.classList.add('progress-bar');

        const fill = document.createElement('div');
        fill.classList.add('progress-fill');
        bar.appendChild(fill);

        box.appendChild(label);
        box.appendChild(bar);
        container.appendChild(box);

        progressBars[i] = fill;
    }
}

function updateProgress(threadID, percent) {
    if (progressBars[threadID]) {
        progressBars[threadID].style.width = `${percent}%`;
    }
}

function startSequential() {
    if (isSorting) return;
    const size = parseInt(document.getElementById('array-size').value);
    if (!size || size < 5 || size > 100) {
        alert('Please enter array size between 5 and 100.');
        return;
    }
    generateArray(size);
    isSorting = true;
    sequentialMergeSort(0, array.length - 1, function() {
        isSorting = false;
    });
}

function startParallel() {
    if (isSorting) return;
    const size = parseInt(document.getElementById('array-size').value);
    if (!size || size < 5 || size > 100) {
        alert('Please enter array size between 5 and 100.');
        return;
    }
    generateArray(size);
    const threads = parseInt(document.getElementById('threads').value);
    createProgressBars(threads);
    isSorting = true;
    parallelMergeSort(0, array.length - 1, threads, 0, function() {
        isSorting = false;
    });
}

function sequentialMergeSort(start, end, callback) {
    if (start >= end) {
        if (callback) callback();
        return;
    }

    const mid = Math.floor((start + end) / 2);

    sequentialMergeSort(start, mid, function() {
        sequentialMergeSort(mid + 1, end, function() {
            merge(start, mid, end, callback);
        });
    });
}

function parallelMergeSort(start, end, threads, threadID, callback) {
    if (start >= end) {
        if (callback) callback();
        return;
    }

    const mid = Math.floor((start + end) / 2);

    for (let i = start; i <= end; i++) {
        threadColorMap[i] = threadID;
    }
    renderArray();

    const total = end - start + 1;
    updateProgress(threadID, Math.min(100, (total / array.length) * 100));

    setTimeout(function() {
        if (threads > 1) {
            let finished = 0;
            parallelMergeSort(start, mid, threads / 2, threadID * 2, function() {
                finished++;
                if (finished === 2) merge(start, mid, end, callback);
            });
            parallelMergeSort(mid + 1, end, threads / 2, threadID * 2 + 1, function() {
                finished++;
                if (finished === 2) merge(start, mid, end, callback);
            });
        } else {
            sequentialMergeSort(start, mid, function() {
                sequentialMergeSort(mid + 1, end, function() {
                    merge(start, mid, end, callback);
                });
            });
        }
    }, speed * 2);
}

function merge(start, mid, end, callback) {
    let temp = [];
    let i = start, j = mid + 1;
    let k = start;

    function stepMerge() {
        if (i <= mid && j <= end) {
            if (array[i] < array[j]) {
                temp.push(array[i++]);
            } else {
                temp.push(array[j++]);
            }
            setTimeout(stepMerge, speed);
        } else if (i <= mid) {
            temp.push(array[i++]);
            setTimeout(stepMerge, speed);
        } else if (j <= end) {
            temp.push(array[j++]);
            setTimeout(stepMerge, speed);
        } else {
            let idx = 0;
            function placeBack() {
                if (k <= end) {
                    array[k] = temp[idx++];
                    threadColorMap[k] = -1;
                    renderArray([k]);
                    k++;
                    setTimeout(placeBack, speed);
                } else {
                    if (callback) callback();
                }
            }
            placeBack();
        }
    }
    stepMerge();
}

// Initial setup
generateArray(30);
