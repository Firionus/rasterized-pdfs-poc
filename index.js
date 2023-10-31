import * as pdfjs from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { jsPDF } from "jspdf";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

console.log("Hello World");

const canvas = document.getElementById("canvas");


async function onFileSelect(e) {
    console.log(e);

    let pdfFile = this.files[0];
    let fileName = pdfFile.name;
    console.log("file is", pdfFile);
    
    document.getElementById("progress_indicator").innerHTML = `Processing ${fileName} ...`;
    
    // Convert to images

    let pdfData = await pdfFile.arrayBuffer();

    // let pdfReader = new FileReader();
    //let pdfData = pdfReader.readAsArrayBuffer(pdfFile);
    
    console.log(pdfData);
    let pdf = await pdfjs.getDocument(pdfData).promise;

    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF({
        putOnlyUsedFonts: true,
        compress: true,
    });


    console.log(pdf);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        let page = await pdf.getPage(pageNumber);
        var scale = 2;
        var viewport = page.getViewport({scale: scale});
    
        // Prepare canvas using PDF page dimensions
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
    
        var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
        await page.render(renderContext).promise;

        if (pageNumber != 1) {
            doc.addPage();
        }
        doc.addImage(
            canvas,
            "PNG",
            0,
            0,
            210,
            297,
            `Page ${pageNumber}`,
            "SLOW"
        )
    }

    doc.save(`compressed_${fileName}`);
    

   document.getElementById("progress_indicator").innerHTML = "Done. Document was downloaded to your computer.";
}

document.getElementById("in").addEventListener("change", onFileSelect);

document.getElementById("in").hidden = false;
document.getElementById("progress_indicator").innerHTML = "Please select a file";
