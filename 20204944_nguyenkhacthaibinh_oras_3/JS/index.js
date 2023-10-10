const Config = {
    numberId: 0,
    MSSV: '_20204944',
}

const Global = {
    currentSelectBox: null,
}

function createElement(tagName, className = null, id = null) {
    const node = document.createElement(tagName)
    if (className !== null)
        node.classList.add(className);
    if (id !== null)
        node.id = id;
    return node;
}

function createInputBox(inputType) {
    const inputBox = createElement('div', 'inputBox');
    switch (inputType) {
        case 'Text':
            const inputTextNode = createElement('input', null, Config.numberId++);
            inputBox.appendChild(inputTextNode);
            break;
        case 'List':
            const inputSelectNode = createElement('select', null, Config.numberId++);
            inputBox.appendChild(inputSelectNode);
            break;
        case 'Check':
            break;
    }
    return inputBox;
}

function createLabel(value, isGroupTittle = false) {
    const node = createElement('input', null, null);
    node.value = value;
    node.readOnly = true;
    node.ondblclick = () => {
        node.readOnly = false;
    }

    node.onkeypress = (event) => {
        if (event.keyCode === 13) {
            if (isGroupTittle) {
                node.value = node.value + Config.MSSV;
                const temp = createElement('span');
                temp.style.fontFamily = 'Times';
                temp.style.fontsize = '16px';
                temp.style.fontWeight = 'bold';
                document.getElementsByTagName('body')[0].appendChild(temp);
                temp.textContent = node.value;
                node.style.width = `${temp.offsetWidth + 20}px`;
                document.getElementsByTagName('body')[0].removeChild(temp);
            }
            node.readOnly = true;
        }
    }

    node.onLostFocusHandler = () => {
        if (isGroupTittle)
            node.value = node.value + Config.MSSV;
        node.readOnly = true;
    }

    return node;
}

function createButton(iconPath, className=null) {
    const node = createElement('button', 'icon-button');
    if (className)
        node.classList.add(className);
    const img = createElement('img');
    node.appendChild(img);
    img.src = iconPath;
    img.classList.add('NotHideSelectBox');
    return node;
}

function createItem(parent, inputType) {
    const rowEdit = createElement('div', 'rowEdit');
    const labelBox = createElement('div', 'labelBox', Config.numberId++);
    const inputBox = createInputBox(inputType);
    const deleteButton = createButton('Images/delete-button-icon.svg');
    deleteButton.onclick = (event) => {
        if (window.confirm(`Nguyễn Khắc Thái Bình 20204944 \nBạn có chắc chắn xóa trường thông tin: ${
            labelBox.children[0].value} hay không?`))
            parent.removeChild(rowEdit);
    }
    labelBox.appendChild(createLabel('Item Info name'));
    rowEdit.appendChild(labelBox);
    rowEdit.appendChild(inputBox);
    if (inputType !== 'Text') {
        const editButtonBox = createElement('div', 'SelectTypeBox');
        const editButton = createButton('Images/button-icon.svg', 'SelectButtonInterface');
        editButtonBox.appendChild(editButton);
        editButton.onclick = (event) => {
            showSelectTypeMenu(editButton);
        }
        const dataList = createElement('div', 'SelectTypeMenu');
        const addBox = createElement('input');
        addBox.onkeypress = (event) => {
            if (event.keyCode !== 13)
                return;
            const text = addBox.value;

            const dataListNode = addBox.parentNode;
            const inputNode = inputType === 'List' ? inputBox.children[0] : inputBox;
            const dataBox = createElement('div');
            const dataNode = createElement('option');
            dataNode.innerHTML = text;
            const dataDeleteButton = createButton('Images/delete-button-icon.svg', 'NotHideSelectBox');
            let dataNodeClone = null;
            if (inputType === 'List') {
                dataNodeClone = createElement('option');
                dataNodeClone.innerHTML = text;
            } else {
                dataNodeClone = createElement('div', 'radioBox');
                const dataNodeCloneInput = createElement('input', null);
                dataNodeCloneInput.name = labelBox.id;
                dataNodeCloneInput.type = 'radio';
                const dataNodeCloneLabel = createElement('label');
                dataNodeCloneLabel.innerText = text;
                dataNodeClone.appendChild(dataNodeCloneInput);
                dataNodeClone.appendChild(dataNodeCloneLabel);
            }
            dataDeleteButton.onclick = () => {
                dataListNode.removeChild(dataBox);
                inputNode.removeChild(dataNodeClone);
            }
            dataBox.appendChild(dataNode);
            dataBox.appendChild(dataDeleteButton);
            inputNode.appendChild(dataNodeClone)

            dataListNode.appendChild(dataBox);
            addBox.value = '';
        }
        dataList.appendChild(addBox);
        editButtonBox.appendChild(dataList);
        rowEdit.appendChild(editButtonBox);
    }
    rowEdit.appendChild(deleteButton);
    return rowEdit;
}

function addNewItem(element) {
    const groupBox = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    groupBox.appendChild(createItem(groupBox, element.innerText));
    Global.currentSelectBox = null;
}


function addNewGroupItem() {
    const inTittle = document.getElementsByClassName('InTittle')[0].cloneNode(true);
    const labelBox = createElement('div', 'labelBox');
    labelBox.appendChild(createLabel('Group Item' + Config.MSSV, true));
    labelBox.style.minWidth = 'auto';
    inTittle.replaceChild(labelBox, inTittle.children[1]);


    const deleteButton = createButton('Images/delete-button-icon.svg');
    deleteButton.style.marginTop = 0;
    const temp = createElement('div');
    temp.appendChild(deleteButton);
    inTittle.insertBefore(temp, inTittle.children[2]);


    const inTittleBox = createElement('div', 'InTittleBox');
    const groupBox = createElement('div', 'GroupBox');
    groupBox.appendChild(inTittleBox);
    inTittleBox.appendChild(inTittle);
    deleteButton.onclick = () => {
        if (window.confirm(`Nguyễn Khắc Thái Bình 20204944 \nBạn có chắc chắn xóa nhóm thông tin: ${
            labelBox.children[0].value} hay không?`))
            document.getElementById('mainContent').removeChild(groupBox.parentNode);
    }
    const parent = createElement('div');
    parent.appendChild(groupBox);
    document.getElementById('mainContent').appendChild(parent);
}