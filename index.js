// Get the PDF file URL
const pdfUrl = "./pdf-files/annotation.pdf"

const canvas = document.getElementById("pdf-canvas")

pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/pdf.worker.mjs"

// Load the PDF file using PDF.js
pdfjsLib.getDocument(pdfUrl).promise.then(function (pdfDoc) {
  pdfDoc
    .getPage(1)
    .then(function (page) {
      const viewport = page.getViewport({ scale: 1 })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      }
      page
        .render(renderContext)
        .promise.then(function () {
          console.log("Rendering complete")
        })
        .catch(function (error) {
          console.log("Error rendering page:", error)
        })

      // Load annotations data
      page
        .getAnnotations()
        .then(function (annotations) {
          annotations.forEach(function (annotation) {
            if (annotation.subtype === "Text") {
              // Render a text annotation
              const textRect = annotation.rect
              const text = document.createElement("div")
              text.style.position = "absolute"
              text.style.left = textRect[0] + "px"
              text.style.top = textRect[1] + "px"
              text.style.width = textRect[2] - textRect[0] + "px"
              text.style.height = textRect[3] - textRect[1] + "px"
              text.style.backgroundColor = "green"
              text.style.opacity = "0.5"
              text.innerText = annotation.contents
              canvas.parentNode.appendChild(text)
            } else if (annotation.subtype === "Highlight") {
              // Render a highlight annotation
              const highlightRect = annotation.rect
              const highlight = document.createElement("div")
              highlight.style.position = "absolute"
              highlight.style.left = highlightRect[0] + "px"
              highlight.style.top = highlightRect[1] + "px"
              highlight.style.width = highlightRect[2] - highlightRect[0] + "px"
              highlight.style.height =
                highlightRect[3] - highlightRect[1] + "px"
              highlight.style.backgroundColor = "yellow"
              highlight.style.opacity = "0.5"
              canvas.parentNode.appendChild(highlight)
            }
          })
        })
        .catch(function (error) {
          console.log("Error loading annotations:", error)
        })

      page.getTextContent().then(function (textContent) {
        let text = ""
        for (let i = 0; i < textContent.items.length; i++) {
          const item = textContent.items[i]
          text += item.str
        }
        console.log(text)
      })
    })
    .catch(function (error) {
      console.log("Error loading PDF file:", error)
    })
})
