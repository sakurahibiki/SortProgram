const container = document.getElementById('array-container');
let array = [];
let threadColorMap = {};  // Maps index to thread

// 8 different thread colors
const threadColors = [
    '#ff0000', // Red
    '#ffa500', // Orange
    '#ffff00', // Yellow
    '#008000', // Green
    '#00ffff', // Cyan
    '#0000ff', // Blue
    '#800080', // Purple
    '#ff00ff'  // Magenta
];

function generateArray(size = 30) {
    array = [];
    threadColorMap = {};
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 300) + 20);
        threadColorMap[i] = -1; // No thread yet
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
            bar.style.backgroundColor = '#ffff00'; // Yellow highlight
            bar.style.color = '#e60000';           // Red text
        } else if (thread !== -1) {
            bar.style.backgroundColor = threadColors[thread % threadColors.length];
            bar.style.color = '#000000'; // Black text on thread colors
        } else {
            bar.style.backgroundColor = '#e60000'; // Default unsorted color
            bar.style.color = '#ffff00';           // Yellow text
        }

        const numberLabel = document.createElement('span');
        numberLabel.innerText = value;
        bar.appendChild(numberLabel);
        container.appendChild(bar);
    });
}

async function startSequential() {
    const size = parseInt(document.getElementById('array-size').value);
    if (!size || size < 5 || size > 100) {
        alert('Please enter array size between 5 and 100.');
        return;
    }
    generateArray(size);
    await sequentialMergeSort(0, array.length - 1);
}

async function startParallel() {
    const size = parseInt(document.getElementById('array-size').value);
    if (!size || size < 5 || size > 100) {
        alert('Please enter array size between 5 and 100.');
        return;
    }
    generateArray(size);
    const threads = parseInt(document.getElementById('threads').value);
    await parallelMergeSort(0, array.length - 1, threads, 0);
}

async function sequentialMergeSort(start, end) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await sequentialMergeSort(start, mid);
    await sequentialMergeSort(mid + 1, end);
    await merge(start, mid, end);
}

async function parallelMergeSort(start, end, threads, threadID) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    // Assign thread color
    for (let i = start; i <= end; i++) {
        threadColorMap[i] = threadID;
    }
    renderArray();
    await sleep(400); // Show split

    if (threads > 1) {
        await Promise.all([
            parallelMergeSort(start, mid, threads / 2, threadID * 2),
            parallelMergeSort(mid + 1, end, threads / 2, threadID * 2 + 1)
        ]);
    } else {
        await sequentialMergeSort(start, mid);
        await sequentialMergeSort(mid + 1, end);
    }

    await merge(start, mid, end);

    // After merge, unify color back to default
    for (let i = start; i <= end; i++) {
        threadColorMap[i] = -1;
    }
    renderArray();
}

async function merge(start, mid, end) {
    let temp = [];
    let i = start, j = mid + 1;

    while (i <= mid && j <= end) {
        if (array[i] < array[j]) {
            temp.push(array[i++]);
        } else {
            temp.push(array[j++]);
        }
    }
    while (i <= mid) temp.push(array[i++]);
    while (j <= end) temp.push(array[j++]);

    for (let k = start; k <= end; k++) {
        array[k] = temp[k - start];
        renderArray([k]);
        await sleep(30);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

generateArray(30); // Default array size on load
