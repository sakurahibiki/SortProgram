const container = document.getElementById('array-container');
let array = [];

function generateArray(size = 30) {
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 300) + 20);
    }
    renderArray();
}

function renderArray(highlight = [], splitSections = []) {
    container.innerHTML = '';

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = value + 'px';
        if (highlight.includes(index)) {
            bar.style.backgroundColor = '#ffff00'; // Highlighted in yellow
            bar.style.color = '#e60000';           // Number in red when highlighted
        } else if (splitSections.includes(index)) {
            bar.style.backgroundColor = '#ff6600'; // Orange color during split sorting
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
    await parallelMergeSort(0, array.length - 1, threads);
}

async function sequentialMergeSort(start, end) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await sequentialMergeSort(start, mid);
    await sequentialMergeSort(mid + 1, end);
    await merge(start, mid, end);
}

async function parallelMergeSort(start, end, threads) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    renderArray([], Array.from({length: end - start + 1}, (_, i) => i + start)); // Highlight split

    await sleep(200); // Pause to show division visually

    if (threads > 1) {
        await Promise.all([
            parallelMergeSort(start, mid, threads / 2),
            parallelMergeSort(mid + 1, end, threads / 2)
        ]);
    } else {
        await sequentialMergeSort(start, mid);
        await sequentialMergeSort(mid + 1, end);
    }

    await merge(start, mid, end);
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

generateArray(30); // Default array on load
