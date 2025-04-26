const container = document.getElementById('array-container');
let array = [];
let threadColorMap = {}; // Maps index to a thread
let isSorting = false;

// 8 different thread colors
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

function generateArray(size = 30) {
    array = [];
    threadColorMap = {};
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 300) + 20);
        threadColorMap[i] = -1; // Initially no thread
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
            bar.style.backgroundColor = '#ffff00'; // Highlight yellow
            bar.style.color = '#e60000';           // Text red
        } else if (thread !== -1) {
            bar.style.backgroundColor = threadColors[thread % threadColors.length];
            bar.style.color = '#000000'; // Black text for thread groups
        } else {
            bar.style.backgroundColor = '#e60000'; // Default
            bar.style.color = '#ffff00';           // Yellow text
        }

        const numberLabel = document.createElement('span');
        numberLabel.innerText = value;
        bar.appendChild(numberLabel);
        container.appendChild(bar);
    });
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
    }, 400); // Delay to show splitting
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
            setTimeout(stepMerge, 30);
        } else if (i <= mid) {
            temp.push(array[i++]);
            setTimeout(stepMerge, 30);
        } else if (j <= end) {
            temp.push(array[j++]);
            setTimeout(stepMerge, 30);
        } else {
            // Finished collecting into temp
            let idx = 0;
            function placeBack() {
                if (k <= end) {
                    array[k] = temp[idx++];
                    threadColorMap[k] = -1; // Reset thread color after merging
                    renderArray([k]);
                    k++;
                    setTimeout(placeBack, 30);
                } else {
                    if (callback) callback();
                }
            }
            placeBack();
        }
    }
    stepMerge();
}

// Initial load
generateArray(30);
