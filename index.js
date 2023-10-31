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




    console.log(pdf);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        let page = await pdf.getPage(pageNumber);
        var scale = 2;
        var viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        const width = viewport.width/scale; // in pt
        const height = viewport.height/scale; // in pt

        if (width <= height) {
            var orientation = "portrait"
        } else {
            var orientation = "landscape"
        };

        if (pageNumber == 1) {
            var doc = new jsPDF({
                orientation: orientation,
                unit: "pt",
                format: [width, height], // order does not matter, is set by orientation
                putOnlyUsedFonts: true,
                compress: true,
            });
        } else {
            doc.addPage([width, height], orientation);
        }
        doc.addImage(
            canvas,
            "PNG",
            0,
            0,
            width,
            height,
            `Page ${pageNumber}`,
            "SLOW"
        )
    }

    console.log(fileName);
    let nameBeginning = fileName.substring(0, fileName.lastIndexOf("."));
    doc.save(`${nameBeginning} rasterized.pdf`);


    document.getElementById("progress_indicator").innerHTML = "Done. Document was downloaded to your computer.";
}

document.getElementById("in").addEventListener("change", onFileSelect);

document.getElementById("in").hidden = false;
document.getElementById("progress_indicator").innerHTML = "Please select a file";
