import * as pdfjs from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { jsPDF } from "jspdf";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

console.log("Hello World");

const canvas = document.getElementById("canvas");
const processing_text = document.getElementById("processing_text");
const processing_bar = document.getElementById("processing_bar");
const file_input = document.getElementById("in");

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

async function onFileSelect() {
    if (file_input.files.length == 0) {return}

    document.getElementById("done_section").style.display = "none";
    document.getElementById("select_file_section").style.display = "none";
    processing_text.innerHTML = "Processing..."
    document.getElementById("processing_section").style.display = "block";

    let pdfFile = file_input.files[0];
    let fileName = pdfFile.name;
    console.log("file is", pdfFile);

    // Convert to images

    let pdfData = await pdfFile.arrayBuffer();

    // let pdfReader = new FileReader();
    //let pdfData = pdfReader.readAsArrayBuffer(pdfFile);

    console.log(pdfData);
    let pdf = await pdfjs.getDocument(pdfData).promise;

    console.log(pdf);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

        processing_text.innerHTML = `Processing page ${pageNumber} of ${pdf.numPages}...`;
        processing_bar.value = (pageNumber-.5)/pdf.numPages;

        let page = await pdf.getPage(pageNumber);
        var scale = document.getElementById("dpi_input").value/72;
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

        // needed to let the browser update the canvas for the user
        await new Promise(resolve => setTimeout(resolve, 0));

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

        // await Sleep(0);

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

    document.getElementById("select_file_section").style.display = "flex";
    document.getElementById("done_section").style.display = "block";
    document.getElementById("processing_section").style.display = "none";

    document.getElementById("file_select_label").innerHTML = "Choose another file…"

    file_input.value = "";
}

document.getElementById("in").addEventListener("change", onFileSelect);

document.getElementById("loading_section").style.display = 'none';
document.getElementById("select_file_section").style.display = "flex";