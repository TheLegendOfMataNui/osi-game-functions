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

function functionContainsToken(namespaceName, functionName, functionData, token) {
    return (namespaceName + "::" + functionName).toLowerCase().includes(token) || functionData.info.toLowerCase().includes(token);
}

function functionVersionContainsToken(functionVersionData, token) {
    // Address
    if (functionVersionData.address.toLowerCase() == token)
        return true;

    // Parameter types
    for (var i = 0; i < functionVersionData.argc[1]; i++) {
        if (typeName(functionVersionData.argt[i][0]).toLowerCase().includes(token)) {
            return true;
        }
    }
    return false;
}

function applyFilter(filterText) {
    for (var namespaceName in data) {
        let namespace = data[namespaceName];
        var showNamespace = false;

        for (functionName in namespace.functions) {
            let func = namespace.functions[functionName];

            var show = true;
            var tokens = filterText.split(" ");
            for (var i = 0; i < tokens.length; i++) {
                if (!functionContainsToken(namespaceName, functionName, func, tokens[i].toLowerCase())) {
                    // Only show the function if one of the versions contains the token
                    show = false;
                    for (versionName in func.versions) {
                        for (var j = 0; j < func.versions[versionName].length; j++) {
                            show = functionVersionContainsToken(func.versions[versionName][j], tokens[i].toLowerCase());
                            if (show)
                                break;
                        }
                        if (show)
                            break;
                    }
                }
                if (!show)
                    break;
            }
            if (show)
                showNamespace = true;

            functionElements[(namespaceName + "::" + functionName).toLowerCase()].style.display = show ? "" : "none";
        }
        namespaceElements[namespaceName].style.display = showNamespace ? "" : "none";
    }
}

function createFunctionVersionElement(namespaceName, name, versionName, data) {
    let element = document.createElement("div");
    element.classList.add("row", "osi-function-version");

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
    element.classList.add("osi-function");
    let fullName = namespaceName + "::" + name;

    let headerElement = document.createElement("h4");
    let nameElement = document.createElement("code");
    nameElement.innerHTML = fullName.toLowerCase();
    headerElement.appendChild(nameElement);
    element.appendChild(headerElement);

    let descElement = document.createElement("p");
    descElement.innerHTML = data.info.length == 0 ? "&lt;No info&gt;" : data.info;
    element.appendChild(descElement);

    for (versionName in data.versions) {
        for (var i = 0; i < data.versions[versionName].length; i++) {
            let e = createFunctionVersionElement(namespaceName, name, versionName, data.versions[versionName][i]);
            element.appendChild(e);
        }
    }

    return element;
}

function createNamespaceElement(name, data) {
    let element = document.createElement("li");
    element.classList.add("osi-namespace", "list-group-item", "p-0");
    let anchorElement = document.createElement("a");
    let headerElement = document.createElement("div");
    headerElement.classList.add("osi-namespace-header");
    headerElement.setAttribute("data-toggle", "collapse");
    headerElement.setAttribute("href", "#namespace-" + name);
    let nameElement = document.createElement("h3");
    nameElement.innerHTML = name;
    headerElement.appendChild(nameElement);
    let descElement = document.createElement("p");
    descElement.innerHTML = data.info.length == 0 ? "<No info>" : data.info;
    headerElement.appendChild(descElement);
    anchorElement.appendChild(headerElement);
    element.appendChild(anchorElement);
    let contentElement = document.createElement("div");
    contentElement.classList.add("collapse", "show");
    contentElement.setAttribute("id", "namespace-" + name);

    for (functionName in data.functions) {
        let e = createFunctionElement(name, functionName, data.functions[functionName]);
        contentElement.appendChild(e);
        functionElements[(name + "::" + functionName).toLowerCase()] = e;
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

    filterInput.addEventListener("input", function(event) { applyFilter(filterInput.value); });
}

function loadData() {
    fetch("gamefunctions.json").then(function(response) {
        return response.json();
    }).then(function(json) {
        onDataLoaded(json);
    });
}

loadData();