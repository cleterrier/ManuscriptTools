# InDesign bioRxiv templates
These are InDesign templates we use for formatting preprints before submitting them to bioRxiv. See examples [here](https://www.biorxiv.org/content/10.1101/568295v2) or [here](https://www.biorxiv.org/content/10.1101/022962v2). There are two versions of the InDesign template, one for InDesign CC (biorxiv_template_CC2015.indd) and one for earlier versions (biorxiv_template_CS4.idml).

# Illustrator scripts for PDF export
These scripts automate the export of a PDF from one or several Illustrator .ai files. The 'Clean & PDF.jsx' script operates on a single open Illustrator file and exports the PDF in a 'batch_PDF' folder at the same level as the folder containing the Illustrator file. The 'Clean & PDF (batch).jsx' does not need an open Illustrator file; it will ask for an input folder and batch convert all the Illustrator files it contains, exporting the PDFs in a 'batch_PDF' folder at the same level as the chosen folder.

The scripts will do the following:
- Open the Illustrator file (in the case of the batch script)
- Remove all hidden layers from the file
- Flatten the file to prepare for cropping by artboard
- Remove all hidden objects
- Remove all objects containing certain strings in their name (by default "anno", "scale.tif", "scaleprof", "scalebox", modify the 'allNames' array variable to customize)
- Export the file as a PDF (see below for properties)
- Close the Illustrator file

The PDF export properties are defined at the end of the script, in the 'getPDFOptions' function. By default, it uses settings for correct proofing (300 dpi), optimizing the file size (highest quality jpeg compression). You can change the options in the function, or use your own PDF export preset by commenting out the options and call your preset from the function (see comments in the code).

To install the scripts, add them in your Illustrator presets folder (in the Illustrator installation file, look for the 'Presets/.../Scripts' folder). They should appear in the Files>Scripts menu after relaunching Illustrator.
