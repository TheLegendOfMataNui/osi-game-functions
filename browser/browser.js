let filterInput = document.getElementById("filter-input");
let moduleList = document.getElementById("module-list");

let versionNames = {
    "a_0.006": "Alpha",
    "b_01-10-23": "Beta"
}
let variantTypeNames = {
    "1": "OSI Instance",
    "5": "Array",
    "15": "null",
    "16": "integer",
    "17": "String",
    "18": "float",
    "19": "String",
    "20": "color",
    "21": "color",
    "22": "String"
}

let namespaceElements = { };
let functionElements = { };

var data = null;

// Thanks https://stackoverflow.com/a/14794066
function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

function typeName(type) {
    if ((type + "") in variantTypeNames) {
        return variantTypeNames[type + ""];
    }
    else if (isInt(type)) {
        return "Unknown Variant (" + type + ")";
    }
    else {
        return type;
    }
}

function createFunctionVersionElement(namespaceName, name, versionName, data) {
    let element = document.createElement("div");
    element.classList.add("row");

    // Version
    let versionElement = document.createElement("h5");
    versionElement.classList.add("col-sm-2");
    versionElement.innerHTML = versionNames[versionName];
    element.appendChild(versionElement);

    let dataElement = document.createElement("div");
    dataElement.classList.add("col-sm-10");

    // Signature
    let signatureElement = document.createElement("code");
    //signatureElement.classList.add("mb-3"); // TODO: Get some spacing in here!
    dataElement.appendChild(signatureElement);
    var signature = namespaceName.toLowerCase() + "::" + name.toLowerCase() + "(";
    for (var i = 0; i < data.argc[0]; i++) {
        let paramElement = document.createElement("div");
        paramElement.classList.add("row");
        let paramTitleElement = document.createElement("strong");
        paramTitleElement.classList.add("col-sm-3");
        paramTitleElement.innerHTML = "Parameter " + (i + 1);
        paramElement.appendChild(paramTitleElement);
        let paramTypeElement = document.createElement("code");
        paramTypeElement.classList.add("col-sm-2");
        paramTypeElement.innerHTML = typeName(data.argt[i][0]);
        paramElement.appendChild(paramTypeElement);
        dataElement.appendChild(paramElement);
        signature += typeName(data.argt[i][0]);
        if (i < data.argc[1] - 1) {
            signature += ", ";
        }
    }
    for (var i = data.argc[0]; i < data.argc[i]; i++) {
        let paramElement = document.createElement("div");
        paramElement.classList.add("row");
        let paramTitleElement = document.createElement("strong");
        paramTitleElement.classList.add("col-sm-3");
        paramTitleElement.innerHTML = "Parameter " + (i + 1) + " (Optional)";
        paramElement.appendChild(paramTitleElement);
        let paramTypeElement = document.createElement("code");
        paramTypeElement.classList.add("col-sm-2");
        paramTypeElement.innerHTML = typeName(data.argt[i][0]);
        paramElement.appendChild(paramTypeElement);
        dataElement.appendChild(paramElement);
        signature += typeName(data.argt[i][0]);
        if (i < data.argc[1] - 1) {
            signature += ", ";
        }
    }
    signature += ")";
    signatureElement.innerHTML = signature;

    // Address
    let addressElement = document.createElement("div");
    addressElement.classList.add("row");
    let addressTitleElement = document.createElement("div");
    addressTitleElement.classList.add("col-sm-3");
    addressTitleElement.innerHTML = "Address";
    addressElement.appendChild(addressTitleElement);
    let addressValueElement = document.createElement("code");
    addressValueElement.classList.add("col-sm-9");
    addressValueElement.innerHTML = "0x" + data.address;
    addressElement.appendChild(addressValueElement);
    dataElement.appendChild(addressElement);

    element.appendChild(dataElement);

    return element;
}

function createFunctionElement(namespaceName, name, data) {
    let element = document.createElement("div");

    let headerElement = document.createElement("h4");
    let nameElement = document.createElement("code");
    nameElement.innerHTML = namespaceName.toLowerCase() + "::" + name.toLowerCase();
    headerElement.appendChild(nameElement);
    element.appendChild(headerElement);

    let descElement = document.createElement("p");
    descElement.innerHTML = data.info.length == 0 ? "&lt;No info&gt;" : data.info;
    element.appendChild(descElement);

    for (versionName in data.versions) {
        for (var i = 0; i < data.versions[versionName].length; i++) {
            element.appendChild(document.createElement("br"));
            let e = createFunctionVersionElement(namespaceName, name, versionName, data.versions[versionName][i]);
            element.appendChild(e);
        }
    }

    return element;
}

function createNamespaceElement(name, data) {
    let element = document.createElement("li");
    element.classList.add("list-group-item");
    let nameElement = document.createElement("h3");
    nameElement.innerHTML = name;
    element.appendChild(nameElement);
    let descElement = document.createElement("p");
    descElement.innerHTML = data.info;
    element.appendChild(descElement);
    let contentElement = document.createElement("div");

    for (functionName in data.functions) {
        contentElement.appendChild(document.createElement("br"));
        let e = createFunctionElement(name, functionName, data.functions[functionName]);
        contentElement.appendChild(e);
        functionElements[functionName] = e;
    }

    element.appendChild(contentElement);
    return element;
}

function onDataLoaded(loadedData) {
    data = loadedData;

    for (namespace in data) {
        let element = createNamespaceElement(namespace, data[namespace]);
        moduleList.appendChild(element);
        namespaceElements[namespace] = element;
    }
}

function loadData() {
    fetch("/gamefunctions.json").then(function(response) {
        return response.json();
    }).then(function(json) {
        onDataLoaded(json);
    });
}

loadData();