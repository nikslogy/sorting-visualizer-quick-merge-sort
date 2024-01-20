// animation speed for the visualizations
const animationSpeed = 200;

// Function to generate different types of lists
function generateList(type) {
  switch (type) {
    case 'select':
      return [];
    case 'sorted':
      return [1, 2, 3, 4, 5, 6];
    case 'opposite':
      return [6, 5, 4, 3, 2, 1];
    case 'nearly':
      return [1, 3, 2, 6, 5, 4];
    case 'unsorted':
      return [4, 1, 6, 3, 2, 5];
    default:
      return [];
  }
}

// Function to update the textbox with the generated list
function updateTextboxWithList(list) {
  const numberInput = document.getElementById('numberInput');
  numberInput.value = list.join(', ');
}

// Function to create arrow elements for visualization
function createArrow(containerId) {
    const arrowContainer = document.getElementById(containerId);
    if (!arrowContainer) {
      console.error(`Arrow container with ID ${containerId} not found!`);
      return null;
    }
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = '↑';
    arrowContainer.appendChild(arrow);
    return arrow;
  }

// Function to create array elements for visualization
function createArrayElements(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found!`);
    return [];
  }
  container.innerHTML = '';
  return list.map(num => {
    const element = document.createElement('div');
    element.className = 'array-element';
    element.textContent = num;
    container.appendChild(element);
    return element;
  });
}

// Function to move the arrow during visualization
function moveArrow(index, arrayElements, arrow) {
  if (!arrow || !arrayElements[index]) {
    console.error('Arrow is undefined or the target element does not exist at moveArrow');
    return;
  }
  
  // Get the target element and its position
  const targetElement = arrayElements[index];

  // Calculate the horizontal center of the target element
  const targetElementCenter = targetElement.offsetLeft + (targetElement.offsetWidth / 2);

  // Set the arrow position
  arrow.style.left = `${targetElementCenter}px`;
  arrow.style.bottom = '0px'; // Adjust the arrow to be at the bottom of the array element container
  arrow.style.display = 'block'; // Ensure the arrow is visible
}


// Function to simulate sleep for animation delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to describe the current step in the visualization
function updateStepDescription(description, sortType) {
  const stepDescriptionElement = sortType === 'quick' ? document.getElementById('quickStepDescription') : document.getElementById('mergeStepDescription');
  if (stepDescriptionElement) {
    stepDescriptionElement.textContent = description;
  }
}


// Function to update the UI to reflect the current state of the array
function updateArrayUI(arr, arrayElements) {
  if (arr.length !== arrayElements.length) {
    console.error('Length mismatch between arr and arrayElements');
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    arrayElements[i].textContent = arr[i];
  }
}

// Quick Sort algorithm with visualization
async function quickSort(arr, left, right, arrayElements, arrow) {
  if (left < right) {
    let partitionIndex = await partition(arr, left, right, arrayElements, arrow);
    arrayElements[partitionIndex].style.backgroundColor = "green";
    await Promise.all([
      quickSort(arr, left, partitionIndex - 1, arrayElements, arrow),
      quickSort(arr, partitionIndex + 1, right, arrayElements, arrow)
    ]);
  }
  if (left === 0 && right === arr.length - 1) {
    updateStepDescription("Quick Sort completed!", 'quick');
    arrayElements.forEach(element => element.style.backgroundColor = "");
    arrow.style.display = 'none';
  }
}

async function partition(arr, left, right, arrayElements, arrow) {
  let pivotIndex = left; // Using the first element as the pivot
  let pivot = arr[pivotIndex];
  arrayElements[pivotIndex].style.backgroundColor = "orange";
  updateStepDescription(`Pivot chosen at index ${left}: ${pivot}`, 'quick');
  let i = left + 1; // Start from the next element after the pivot

  for (let j = i; j <= right; j++) {
    arrayElements[j].style.backgroundColor = "lightblue";
    await sleep(animationSpeed);
    if (arr[j] < pivot) {
      if (i !== j) {
        updateStepDescription(`Comparing: ${arr[j]} < ${pivot}, so swap ${arr[i]} with ${arr[j]}`, 'quick');
        await swap(arr, i, j, arrayElements, arrow);
      } else {
        updateStepDescription(`Comparing: ${arr[j]} < ${pivot}, no need to swap with itself`, 'quick');
      }
      i++;
    } else {
      updateStepDescription(`Comparing: ${arr[j]} >= ${pivot}, no swap needed`, 'quick');
    }
    arrayElements[j].style.backgroundColor = "";
  }

  // Swap pivot with the last element that was moved to the left side
  if (i - 1 !== pivotIndex) {
    updateStepDescription(`Swapping pivot ${pivot} with ${arr[i - 1]}, to put pivot in correct position`, 'quick');
    await swap(arr, pivotIndex, i - 1, arrayElements, arrow);
  } else {
    updateStepDescription(`Pivot ${pivot} is already in the correct position`, 'quick');
  }
  arrayElements[pivotIndex].style.backgroundColor = "";
  arrayElements[i - 1].style.backgroundColor = "green";
  return i - 1; // Return the index where the pivot is placed
}


async function swap(arr, i, j, arrayElements, arrow) {
  moveArrow(j, arrayElements, arrow);
  updateStepDescription(`Swapping elements: ${arr[i]} and ${arr[j]}`, 'quick');
  arrayElements[i].style.backgroundColor = "red";
  arrayElements[j].style.backgroundColor = "red";
  await sleep(animationSpeed);
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  updateArrayUI(arr, arrayElements);
  moveArrow(i, arrayElements, arrow);
  arrayElements[i].style.backgroundColor = "";
  arrayElements[j].style.backgroundColor = "";
}


// Merge Sort algorithm with visualization
async function mergeSort(arr, left, right, arrayElements, arrow) {
  if (left < right) {
    let middle = Math.floor((left + right) / 2);
    await mergeSort(arr, left, middle, arrayElements, arrow);
    await mergeSort(arr, middle + 1, right, arrayElements, arrow);
    await merge(arr, left, middle, right, arrayElements, arrow);
  }
}

async function merge(arr, left, middle, right, arrayElements, arrow) {
  let n1 = middle - left + 1;
  let n2 = right - middle;
  let L = new Array(n1);
  let R = new Array(n2);

  // Initialize left and right sub-arrays
  for (let i = 0; i < n1; i++) {
    L[i] = arr[left + i];
    arrayElements[left + i].style.backgroundColor = "red";
    updateStepDescription(`Left sub-array [index ${left + i}]: ${L[i]}`, 'merge');
  }
  for (let j = 0; j < n2; j++) {
    R[j] = arr[middle + 1 + j];
    arrayElements[middle + 1 + j].style.backgroundColor = "yellow";
    updateStepDescription(`Right sub-array [index ${middle + 1 + j}]: ${R[j]}`, 'merge');
  }

  let i = 0, j = 0, k = left;

  // Merge the sub-arrays
  while (i < n1 && j < n2) {

    moveArrow(k, arrayElements, arrow);
    await sleep(animationSpeed);
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      updateStepDescription(`Merging [${L[i]}] from left into main array at index ${k}`, 'merge');
      i++;
    } else {
      arr[k] = R[j];
      updateStepDescription(`Merging [${R[j]}] from right into main array at index ${k}`, 'merge');
      j++;
    }
    arrayElements[k].style.backgroundColor = "green";
    updateArrayUI(arr, arrayElements);
    k++;
  }

  // Complete the merge for any remaining elements in L[]
  while (i < n1) {
    await sleep(animationSpeed);
    arr[k] = L[i];
    arrayElements[k].style.backgroundColor = "green";
    updateArrayUI(arr, arrayElements);
    updateStepDescription(`Completing merge with element [${L[i]}] from left at index ${k}`, 'merge');
    i++;
    k++;
  }

  // Complete the merge for any remaining elements in R[]
  while (j < n2) {
    await sleep(animationSpeed);
    arr[k] = R[j];
    arrayElements[k].style.backgroundColor = "green";
    updateArrayUI(arr, arrayElements);
    updateStepDescription(`Completing merge with element [${R[j]}] from right at index ${k}`, 'merge');
    j++;
    k++;
  }

  // Clear any merge-related coloring
  for (let m = left; m <= right; m++) {
    arrayElements[m].style.backgroundColor = ""; // Reset to the original color
    updateStepDescription(`Merge complete for index ${m}`, 'merge');
    arrow.style.display = 'none';
  }
}




// Function to measure the time taken by a sort function
async function timeSort(sortPromise) {
  const start = performance.now();
  await sortPromise;
  const end = performance.now();
  return end - start;
}

// Function to create a bar chart to display the sorting times
function createChart(mergeSortTime, quickSortTime) {
  const ctx = document.getElementById('sorting-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Merge Sort', 'Quick Sort'],
      datasets: [{
        label: 'Time (ms)',
        data: [mergeSortTime, quickSortTime],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Function to run both sorts and create the chart
async function runBothSorts() {
  const numberInput = document.getElementById('numberInput');
  const list = numberInput.value.split(',').map(Number);

  quickArrayElements = createArrayElements(list, 'quickSortContainer');
  mergeArrayElements = createArrayElements(list, 'mergeSortContainer');
  quickArrow = createArrow('quickArrowContainer');
  mergeArrow = createArrow('mergeArrowContainer');

  if (!quickArrayElements.length || !mergeArrayElements.length || !quickArrow || !mergeArrow) {
    console.error('One or more elements for sorting visualizations are not initialized correctly.');
    return;
  }

  const quickPromise = quickSort(list.slice(), 0, list.length - 1, quickArrayElements, quickArrow);
  const mergePromise = mergeSort(list.slice(), 0, list.length - 1, mergeArrayElements, mergeArrow);

  const [quickSortTime, mergeSortTime] = await Promise.all([
    timeSort(quickPromise), 
    timeSort(mergePromise)
  ]);

  createChart(mergeSortTime, quickSortTime);
}

// Initialization function to set up event listeners and default values
function init() {
    const dropdown = document.getElementById('listTypeDropdown');
    const quickSortBtn = document.getElementById('quickSortBtn');
    const mergeSortBtn = document.getElementById('mergeSortBtn');
    const bothBtn = document.getElementById('bothBtn');
    
    if (!dropdown || !quickSortBtn || !mergeSortBtn || !bothBtn) {
      console.error('One or more elements are not found in the DOM.');
      return;
    }
    
    // Populate the dropdown menu with options
    const options = ['select','sorted', 'opposite', 'nearly', 'unsorted'];
    options.forEach(option => {
      let opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option.charAt(0).toUpperCase() + option.slice(1) + ' list';
      dropdown.appendChild(opt);
    });
    
    // Set up event listeners
    dropdown.addEventListener('change', function() {
      const selectedType = this.value;
      const list = generateList(selectedType);
      updateTextboxWithList(list);
    });
    
    quickSortBtn.addEventListener('click', () => {
      const list = generateList(dropdown.value);
      quickArrayElements = createArrayElements(list, 'quickSortContainer');
      quickArrow = createArrow('quickArrowContainer');
      quickSort([...list], 0, list.length - 1, quickArrayElements, quickArrow);
    });
    
    mergeSortBtn.addEventListener('click', () => {
      const list = generateList(dropdown.value);
      mergeArrayElements = createArrayElements(list, 'mergeSortContainer');
      mergeArrow = createArrow('mergeArrowContainer');
      mergeSort([...list], 0, list.length - 1, mergeArrayElements, mergeArrow);
    });
    if (!bothBtn) {
        console.error('Both button not found in the DOM.');
        return;
      }
      bothBtn.addEventListener('click', runBothSorts);
  }
  
  // Attach the init function to the DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', init);
