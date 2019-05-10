// 'Batch Clean & PDF' Illustrator script by Christophe Leterrier
// v2

// Main Code [Execution of script begins here]
// uncomment to suppress Illustrator warning dialogs
// app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Define source folder
var sourceFolder = Folder.selectDialog( 'Select the folder with Illustrator files you want to convert to PDF');

// Get path to active document & parent folder
var parentPath = sourceFolder.parent;

// Define destination folders for exported pdf file
var destFolder = Folder(parentPath + "/Batch_pdf/");
if(!destFolder.exists){
    destFolder.create();
}

// Process all files
if (sourceFolder != null) {
		var allFiles = recursiveFolders(sourceFolder, /\.ai$/i);
		batchFileProcess(allFiles);
}


// ============================================================
// Main function (loop on Files array)
// ============================================================

function batchFileProcess(aiFiles)
{
	for (var ai = 0; ai < aiFiles.length; ai++) {
		// open doc and get name without extension
		var doc = app.open(aiFiles[ai]);
		var baseName = decodeURI(doc.name.match(/(.*)\.[^\.]+$/)[1]);

		// *** Process layers (recursive call of function) ***
		var allLayers = recursiveLayers(doc.layers);
		// alert('Found ' + allLayers.length + ' layers');
		// Remove all empty & hidden layers
		allLayers = removeEmptyHiddenLayers(allLayers);

		// *** Process PageItems (loop on PageItems array) ***
		var allItems = doc.pageItems;
		// Removes all items that have defined strings in their name
		var allNames = ["anno", "scale.tif", "scaleprof", "scalebox"];
		allItems = removeByName(allItems, allNames);
		// Removes all hidden items
		allItems = removeHidden(allItems);
		// Prepare crop by flattening
		prepareCrop(allItems);

		// *** Saving ***

		//Save AI
		// var saveAIFile = File(destFolder + '/' + baseName + '.ai');
		// doc.saveAs(saveAIFile, getAIOptions());

		//Save as PDF
		var savePDFFile = File(destFolder + '/' + baseName + '.pdf');
		doc.saveAs(savePDFFile, getPDFOptions());

		// Close file
		doc.close(SaveOptions.DONOTSAVECHANGES);
		}

    return;
}


// ============================================================
// Recursion functions
// ============================================================

// These two functions get all ai files in a folder
function recursiveFolders(fold, exp)
{
	var f_list = Array(); // Matching files array
    f_list = getMyFiles(fold, exp);
	return f_list;
}

function getMyFiles(fold, exp)
{
    var f_array = [];
    var temp = Folder(fold).getFiles(); // All files and folder
    for (var f = 0; f < temp.length; f++) {
        if (temp[f] instanceof File && RegExp(exp).test(temp[f].fsName)){
                  f_array.push(temp[f]);
        }
        if (temp[f] instanceof Folder && temp[f].name.indexOf('batch_') < 0) {
                 f_array = f_array.concat(getMyFiles(temp[f], exp));
        }
    }
	return f_array;
}


// These two functions get all layers in a document
function recursiveLayers(lyrs)
{
	var l_list = [];
	l_list = getMyLayers(lyrs);
	return l_list;
}

function getMyLayers(ogLyrs)
{
	var isInitiallyLocked;
	var l_array = [];

    for(var j = ogLyrs.length - 1; j >= 0; j--)
    {
        //alert(ogLys[j].name);

        // Store locked state of the source layer.
        // Note: Copying is allowed from a locked layer, but pasting to a locked layer is not.
        isInitiallyLocked = ogLyrs[j].locked;
        ogLyrs[j].locked = false;

        l_array.push(ogLyrs[j]);

        // RECURSE: Crawl all sub-layers.
        if(ogLyrs[j].layers.length > 0)
            l_array = l_array.concat(getMyLayers(ogLyrs[j].layers));

        // restore locked state:
        if(isInitiallyLocked) ogLyrs.locked = true;

        // For testing:
        //break;
    }
	return l_array;
}



// ============================================================
// Functions that operate on a layers array
// ============================================================

// Remove empty and hidden layers
function removeEmptyHiddenLayers(myLayerArray)
{
	for (var j = myLayerArray.length-1; j >=0; j--) {
		if ((myLayerArray[j].length == 0 && myLayerAray[j].length==0) || myLayerArray[j].visible == false) {
			myLayerArray[j].locked = false;
			myLayerArray[j].visible = true;
			// alert('Removing layer #' + j + ': ' + myLayerArray[j].name);
			myLayerArray[j].remove(); // removes the item in the document
			myLayerArray.splice(j,1); // removes the layer from the array
		}

	}
    return myLayerArray;
}

// ============================================================
// Functions that operate on a PageItems array
// ============================================================

// Remove hidden items
function removeHidden(myItemArray)
{
	for (var j = myItemArray.length -1; j >= 0; j--){
        if(myItemArray[j].hidden) {

			var templayer = myItemArray[j].layer;
			var initLock = templayer.locked;
			var initVis = templayer.visible;

			templayer.locked = false;
			templayer.visible = true;

			myItemArray[j].locked = false;
			myItemArray[j].hidden = true;
			// alert('Removing item #' + j + ': ' + myItemArray[j].name + ' from layer ' + myItemArray[j].layer.name);
			myItemArray[j].remove(); // removes the item in the document, no splice needed (operates on the PageItems array directly)

			templayer.visible = initVis;
			templayer.locked = initLock;
		}
	}
	return myItemArray;
}


// Remove items that contain a given string in their name
function removeByName(myItemArray, nameArray)
{
	for (var j = myItemArray.length -1; j >= 0; j--){
		for (var k = 0; k < nameArray.length; k++){
			if (myItemArray[j].name.indexOf(nameArray[k]) > -1) {

			var debug_name = myItemArray[j].name;
			var debug_layer = myItemArray[j].layer;
			var debug_length = myItemArray[j].length;

			var templayer = myItemArray[j].layer;
			var initLock = templayer.locked;
			var initVis = templayer.visible;

			templayer.locked = false;
			templayer.visible = true;

			myItemArray[j].locked = false;
			myItemArray[j].hidden = true;

			// alert('Removing item #' + j + ': ' + myItemArray[j].name + ' from layer ' + myItemArray[j].layer.name);
			myItemArray[j].remove();// removes the item in the document

			k = nameArray.length; // you have to escape from the string arrays loop!

			templayer.visible = initVis;
			templayer.locked = initLock;
            }
        }
    }
	return myItemArray;
}


// Prepare cropping
function prepareCrop(myItemArray)
{
	for (var j = myItemArray.length -1; j >= 0; j--){
		if (myItemArray[j].typename == 'PathItem' && myItemArray[j].clipping){
				initLock = myItemArray[j].locked;
				myItemArray[j].locked = false;
				myItemArray[j].blendingMode = BlendModes.MULTIPLY;
				myItemArray[j].locked = initLock;
		}
	}
	return myItemArray;
}


// ============================================================
// Functions that define Save options
// ============================================================

// AI files options
function getAIOptions()
{
	var aiSaveOpts = new IllustratorSaveOptions();
	aiSaveOpts.embedLinkedFiles = true;
	return aiSaveOpts;
}

// PDF files options
function getPDFOptions()
{
	var pdfSaveOpts = new PDFSaveOptions();

// This is the list of pdf export properties (comment out if you use a preset)	
	pdfSaveOpts.colorCompression = CompressionQuality.JPEGMAXIMUM;
	pdfSaveOpts.colorDownsampling = 300;
	pdfSaveOpts.colorDownsamplingImageThreshold = 450;
	pdfSaveOpts.colorDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
	pdfSaveOpts.compressArt = true;
	pdfSaveOpts.enablePlainText = true;
	pdfSaveOpts.generateThumbnails = true;
	pdfSaveOpts.grayscaleCompression = CompressionQuality.JPEGMAXIMUM;
	pdfSaveOpts.grayscaleDownsampling = 600;
	pdfSaveOpts.grayscaleDownsamplingImageThreshold = 750;
	pdfSaveOpts.grayscaleDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
	pdfSaveOpts.monochromeCompression = MonochromeCompression.CCIT4;
	pdfSaveOpts.monochromeDownsampling = 1200;
	pdfSaveOpts.monochromeDownsamplingImageThreshold = 1800;
	pdfSaveOpts.monochromeDownsamplingMethod = DownsampleMethod.BICUBICDOWNSAMPLE;
	pdfSaveOpts.optimization = true;
	pdfSaveOpts.preserveEditability = false;

// If you have a pdf export preset you want to use, comment above and uncomment below 
//   	pdfSaveOpts.pDFPreset = "Powerpoint";
	
	return pdfSaveOpts;
}


// ========== END ==========
