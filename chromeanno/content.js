// content.js
console.log('content.js is loaded');
let isTextSelected = false;
let isDragging = false;
let startX, startY, endX, endY;
let annotationCount = 0;
let annotations = [];

document.addEventListener('mousedown', (event) => {
  isTextSelected = window.getSelection().toString().length > 0;
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  console.log('mousedown');
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    endX = event.clientX;
    endY = event.clientY;
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    if (isTextSelected) {
      createAndStoreAnnotation('blue-annotation');
    } else {
      createAndStoreAnnotation('red-annotation');
    }
    isTextSelected = false;
    isDragging = false;
  }
});

function createAndStoreAnnotation(className) {
  const annotationElement = createAnnotationElement(startX, startY, endX, endY, className);
  annotations.push(annotationElement);
  storeAnnotations();
}

function createAnnotationElement(startX, startY, endX, endY, className) {
  const annotationElement = document.createElement('div');
  annotationElement.className = 'annotation ' + className;
  annotationElement.setAttribute('data-count', ++annotationCount);
  annotationElement.style.left = Math.min(startX, endX) + 'px';
  annotationElement.style.top = Math.min(startY, endY) + 'px';
  annotationElement.style.width = Math.abs(endX - startX) + 'px';
  annotationElement.style.height = Math.abs(endY - startY) + 'px';
  annotationElement.innerHTML = annotationCount; // Display annotation number
  document.body.appendChild(annotationElement);
  return annotationElement;
}

function storeAnnotations() {
  chrome.storage.local.set({ annotations: annotations.map(serializeAnnotation) });
}

function serializeAnnotation(annotation) {
  return {
    className: annotation.className,
    count: annotation.getAttribute('data-count'),
    style: {
      left: annotation.style.left,
      top: annotation.style.top,
      width: annotation.style.width,
      height: annotation.style.height
    }
  };
}

// Load stored annotations on page load
chrome.storage.local.get(['annotations'], (result) => {
  const storedAnnotations = result.annotations;
  if (storedAnnotations) {
    annotations = storedAnnotations.map(deserializeAnnotation);
    annotations.forEach((annotation) => document.body.appendChild(annotation));
  }
});

function deserializeAnnotation(serializedAnnotation) {
  const annotationElement = document.createElement('div');
  annotationElement.className = 'annotation ' + serializedAnnotation.className;
  annotationElement.setAttribute('data-count', serializedAnnotation.count);
  annotationElement.style.left = serializedAnnotation.style.left;
  annotationElement.style.top = serializedAnnotation.style.top;
  annotationElement.style.width = serializedAnnotation.style.width;
  annotationElement.style.height = serializedAnnotation.style.height;
  annotationElement.innerHTML = serializedAnnotation.count; // Display annotation number
  return annotationElement;
}
