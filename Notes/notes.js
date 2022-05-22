import { jsPDF } from "jspdf";

var doc = new jsPDF();
var specialElementHandlers = {
    '#test-output': function (element, renderer) {
        return true;
    }
};

$('#export').click(function () {
    doc.fromHTML($('#notes').html(), 15, 15, {
        'width': 170,
            'elementHandlers': specialElementHandlers
    });
    doc.save('sample-file.pdf');
});