// Warning, ugly cobbled together crap follows.
// I echo the above warning from 2012 in 2023.

var svgns = "http://www.w3.org/2000/svg";
var xlns = "http://www.w3.org/1999/xlink";


var rowHeight = Math.sqrt(3) / 2;
var centerFromBase = 0.5 / Math.sqrt(3);
var centerFromTop = rowHeight - centerFromBase;
var scale = 100;

var PASTED_IMAGE = "<PASTED IMAGE>";
var UPLOADED_IMAGE = "<UPLOADED IMAGE>"

function addClippingDefs(defsEl, svgEl) {
    var clip = svgEl("clipPath");
    clip.setAttributeNS(null, "id", "clipup");
    var path = svgEl("path");
    path.setAttributeNS(null, "d", "M 0.5 0 L 1 " + rowHeight + " L 0 " + rowHeight);
    clip.appendChild(path);
    defsEl.appendChild(clip);

    clip = svgEl("clipPath");
    clip.setAttributeNS(null, "id", "clipdown");
    path = svgEl("path");
    path.setAttributeNS(null, "d", "M 0.5 " + rowHeight + " L 0 0L 1 0");
    clip.appendChild(path);
    defsEl.appendChild(clip);
}

function addImage(defsEl, svgEl, imagepath, id) {
    var image = svgEl("image");
    image.setAttributeNS(xlns, "href", imagepath);
    image.setAttributeNS(null, "id", id)
    image.setAttributeNS(null, "width", "2")
    image.setAttributeNS(null, "height", "" + (rowHeight * 2))
    image.setAttributeNS(null, "preserveAspectRatio", "none")
    defsEl.appendChild(image)
}

function getImageSectionId(defs, svgEl, imageid, section, rotation) {
    if ((section == 0) && (rotation == 0)) {
        return imageid;
    }
    var resultId = imageid + 'p' + section + 'r' + rotation;
    if (document.getElementById(resultId)) {
        return resultId;  // slow maybe?
    }
    var angle = 60 * rotation;
    var transImage = svgEl("use");
    var transarg = ""
    // This is total horseshit, should have had 0,0 center of triangle
    if ((rotation & 1) == 1) {
        var rotateYcenter = ((section & 1) == 1)
            ? centerFromBase : centerFromTop;
        if ((section & 1) == 1) {
            transarg = "translate(0," + centerFromBase + ")";
        } else {
            transarg = "translate(0,-" + centerFromBase + ")";
        }
    } else {
        var rotateYcenter = ((section & 1) == 1)
            ? centerFromBase : centerFromTop;
    }

    transImage.setAttributeNS(null, "transform", transarg +
        "rotate(" + angle + ",0.5," + rotateYcenter + ") " +
        "translate(-" +
        (section % 3) * 0.5
        + ",-" +
        Math.floor(section / 3) * rowHeight
        + ") ");
    transImage.setAttributeNS(xlns, "href", "#" + imageid);
    transImage.setAttributeNS(null, "id", resultId)
    defs.appendChild(transImage);

    return resultId;
}


function updateImages() {
    var highlight = document.getElementById('highlight');
    var highlightImg = document.getElementById('highlight_img')

    // JavaScript closures, how do they work?
    function imageMouseOverFn(image) {
        var sourceImage = image;
        return function () {
            highlightImg.src = sourceImage.src;
            highlight.style.left = sourceImage.offsetLeft - 200;
            highlight.style.top = sourceImage.offsetTop;
            highlight.style.display = 'block';
        }
    }

    for (var i = 1; i < 7; i++) {
        var image = document.getElementById('image' + i);
        var isrc = document.getElementById('isrc' + i);
        var src_val = isrc.value;
        if (src_val == PASTED_IMAGE) {
            image.src = image.pasted_data_url;
        } else if (src_val == UPLOADED_IMAGE)
            image.src = image.uploaded_data_url;
        else {
            image.src = isrc.value;
        }
        var h = isrc.offsetHeight;
        var w = h / rowHeight;
        image.width = w;
        image.height = h;
        isrc.onchange = updateImages;
        isrc.onpaste = updateImages;
        isrc.onkeyup = updateImages;
        image.onmouseover = imageMouseOverFn(image);
        image.onmouseout = function () {
            highlight.style.display = 'none';
        }
    }
}

function runScript(sameDoc) {
    var tris = document.querySelectorAll("#single-sheet Triangle");
    var imageSrcs = [];
    for (var i = 1; i < 7; i++) {
        imageSrcs.push(document.getElementById("image" + i).src);
    }
    //  var tris = document.querySelectorAll("#layout-allfaces Triangle");
    var itris1 = document.querySelectorAll("#layout-instructions1 Triangle");
    var itris2 = document.querySelectorAll("#layout-instructions2 Triangle");
    //  var tris = document.querySelectorAll("#layout-test Triangle");


    if (sameDoc) {
        createSvg(document, tris, imageSrcs, itris1, itris2);
    } else {
        var w = window.open(window.location, null, 'width=1000,height=1000');
        w.altOnLoad = function () {
            createSvg(w.document, tris, imageSrcs, itris1, itris2);
        }
    }

}

function createSvg(doc, tris, imageSrcs, instructionTris1, instructionTris2) {
    rawContents = '<svg id="svgroot" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.2" style="height: 900px;width: 700px;"></svg>'

    doc.body.innerHTML = rawContents;
    svgRoot = doc.getElementById('svgroot');

    var svgEl = function (name) {
        return doc.createElementNS(svgns, name);
    }

    var defs = svgEl("defs");
    addClippingDefs(defs, svgEl);

    for (var i = 0; i < 6; i++) {
        addImage(defs, svgEl, imageSrcs[i], "i" + i);
    }
    addImage(defs, svgEl, "images/labels.jpg", "i6");

    svgRoot.appendChild(defs);

    var scaleGroup = trisToGroup(defs, tris, svgEl);
    scaleGroup.setAttributeNS(null, "transform", " scale(95) translate(-0.25,-" + (rowHeight * 1.5) + ") rotate(60,0," + (rowHeight * 2) + ") ");
    svgRoot.appendChild(scaleGroup);

    scaleGroup = trisToGroup(defs, instructionTris1, svgEl);
    scaleGroup.setAttributeNS(null, "transform", "translate(420,0) scale(45)");
    svgRoot.appendChild(scaleGroup);

    scaleGroup = trisToGroup(defs, instructionTris2, svgEl);
    scaleGroup.setAttributeNS(null, "transform", "translate(0,550) scale(45)");
    svgRoot.appendChild(scaleGroup);

    //scaleGroup.setAttributeNS(null, "transform", " scale(75)");
}

function trisToGroup(defs, tris, svgEl) {
    var scaleGroup = svgEl("g");

    for (var i = 0; i < tris.length; i++) {
        var t = tris[i];
        var imageid = "i" + t.getAttribute("img");
        var section = parseInt(t.getAttribute("sec"), 10) - 1;
        var rotation = parseInt(t.getAttribute("rot"), 10);
        var xpos = parseInt(t.getAttribute("x"), 10) / 200.0;
        var ypos = parseInt(t.getAttribute("y"), 10) / (100.0 / rowHeight);
        var pointUp = (parseInt(t.getAttribute("pup")) != 0);
        var localGroup = svgEl("g");
        localGroup.setAttributeNS(null, "transform", "translate(" + xpos + "," + ypos + ")");
        imageid = getImageSectionId(defs, svgEl, imageid, section, rotation);
        var use = svgEl("use");
        use.setAttributeNS(xlns, "href", "#" + imageid);
        use.setAttributeNS(null, "clip-path", "url(#" + (pointUp ? "clipup" : "clipdown") + ")")
        localGroup.appendChild(use);
        scaleGroup.appendChild(localGroup);
    }
    return scaleGroup;
}

function myOnload(foo) {
    if (window.altOnLoad) {
        window.altOnLoad();
    } else {
        updateImages();
        var newheight;
        var newwidth;

        var iframe = document.getElementById("instructions_frame");
        var iframe_body = iframe.contentWindow.document.body;

        iframe.width = iframe_body.scrollWidth;
        iframe.height = iframe_body.scrollHeight;
    }

}

document.onpaste = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            // We have an image, let's make sure we've got a slot selected.
            var selected_element_id = document.activeElement.id;
            if ("isrc" != selected_element_id.substring(0, 4)) {
                alert("Please select one of the six text boxes and paste again.");
                return;
            }
            var image_index = parseInt(selected_element_id.substring(4));
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function (event) {
                var image = document.getElementById('image' + image_index);
                var isrc = document.getElementById('isrc' + image_index);
                image.pasted_data_url = event.target.result;
                isrc.value = PASTED_IMAGE;
                updateImages();
            };
            reader.readAsDataURL(blob);
            event.stopPropagation();
        }
    }
};

function uploadImage(event) {
    var reader = new FileReader();
    var image_index = parseInt(event.target.dataset['imageId']);
    reader.onload = function () {
        var output = document.getElementById('output_image');
        var image = document.getElementById('image' + image_index);
        var isrc = document.getElementById('isrc' + image_index);
        image.uploaded_data_url = reader.result;
        isrc.value = UPLOADED_IMAGE;
        updateImages();
    }
    reader.readAsDataURL(event.target.files[0]);
}