// Get the PDF file URL
const pdfUrl = "./pdf-files/pspdfkit-web-demo.pdf";

const canvas = document.getElementById("pdf-canvas");

const initialState = {
  pdfDoc: null, // Variable to hold the loaded PDF document
  currentPage: 1, // Current page number
  zoom: 1, // Initial zoom scale
};

pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/pdf.worker.mjs";

// Function to render a page
const renderPage = () => {
  if (!initialState.pdfDoc) return;

  initialState.pdfDoc.getPage(initialState.currentPage).then((page) => {
    const viewport = page.getViewport({ scale: initialState.zoom });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      console.log("Rendering complete");
    }).catch((error) => {
      console.log("Error rendering page:", error);
    });

    // Clear existing annotations
    const existingAnnotations = document.querySelectorAll('.annotation');
    existingAnnotations.forEach(annotation => annotation.remove());

    // Load annotations data
    page.getAnnotations().then((annotations) => {
      annotations.forEach((annotation) => {
        const annotationElement = document.createElement("div");
        annotationElement.classList.add("annotation");
        annotationElement.style.position = "absolute";
        annotationElement.style.left = annotation.rect[0] + "px";
        annotationElement.style.top = annotation.rect[1] + "px";
        annotationElement.style.width = annotation.rect[2] - annotation.rect[0] + "px";
        annotationElement.style.height = annotation.rect[3] - annotation.rect[1] + "px";

        if (annotation.subtype === "Text") {
          annotationElement.style.backgroundColor = "green";
          annotationElement.style.opacity = "0.5";
          annotationElement.innerText = annotation.contents;
        } else if (annotation.subtype === "Highlight") {
          annotationElement.style.backgroundColor = "yellow";
          annotationElement.style.opacity = "0.5";
        }

        canvas.parentNode.appendChild(annotationElement);
      });
    }).catch((error) => {
      console.log("Error loading annotations:", error);
    });

    page.getTextContent().then((textContent) => {
      let text = "";
      for (let i = 0; i < textContent.items.length; i++) {
        const item = textContent.items[i];
        text += item.str;
      }
      console.log(text);
    });
  }).catch((error) => {
    console.log("Error loading page:", error);
  });
};

// Load the PDF file using PDF.js
pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
  initialState.pdfDoc = pdf;
  renderPage();
}).catch((error) => {
  console.log("Error loading PDF file:", error);
});

// Navigation buttons
document.getElementById('prev-page').addEventListener('click', function () {
  if (initialState.pdfDoc && initialState.currentPage > 1) {
    initialState.currentPage--;
    renderPage(initialState.currentPage);
  }
});

document.getElementById('next-page').addEventListener('click', function () {
  if (initialState.pdfDoc && initialState.currentPage < initialState.pdfDoc.numPages) {
    initialState.currentPage++;
    renderPage(initialState.currentPage);
  }
});

// Zoom buttons
document.getElementById('zoom-in').addEventListener('click', function () {
  if (initialState.pdfDoc) {
    initialState.zoom *= 4 / 3; // Increase zoom scale
    renderPage();
  }
});

document.getElementById('zoom-out').addEventListener('click', function () {
  if (initialState.pdfDoc) {
    initialState.zoom *= 2 / 3; // Decrease zoom scale
    renderPage();
  }
});

