
function hideSelectBox() {
    const dropdowns = document.getElementsByClassName("SelectTypeMenu");
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}
function showSelectTypeMenu(element) {
    hideSelectBox();
    Global.currentSelectBox = element.parentNode;
    element.parentNode.children[1].classList.toggle("show");
}

window.onclick = (event) => {
    if (!event.target.matches('.NotHideSelectBox')
        && (!Global.currentSelectBox || !Global.currentSelectBox.contains(event.target))) {
        console.log(Global.currentSelectBox);
        console.log(event.target);
        hideSelectBox();
        Global.currentSelectBox = null;
    }

}

function exportPDF() {
    const body = $('body')[0];
    html2canvas(body, {
        useCORS: true,
        allowTaint: true,
        onrendered: function (canvas) {
            let data = canvas.toDataURL();
            let docDefinition = {
                content: [{
                    image: data,
                    width: 505
                }]
            };
            pdfMake.createPdf(docDefinition).download("Thông tin sinh viên.pdf");
        }
    });
}
