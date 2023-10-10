const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);


const createMailBtn = $('#createMail_button')
const authorizeBtn = $('#authorize_button')
const signoutBtn = $('#signout_button')
const maiList = $('#mail_list')
const maincontent = $(".maincontent");
const sendMailSec = $(".sendEmailSec")
const closeBtn = $("#close-button")
createMailBtn.style.visibility = 'hidden';




const CLIENT_ID = '107794357490-3s7q1dtudeetndn8ahja59pov8udmgif.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBPBUQz6_jbZCNng7JNLyVuLDhefxylEOY';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = "https://mail.google.com/";

let tokenClient;
let gapiInited = false;
let gisInited = false;

authorizeBtn.style.visibility = 'hidden';
signoutBtn.style.visibility = 'hidden';
$('.loader').classList.add("hidden")


function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}


function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}


function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        authorizeBtn.style.visibility = 'visible';
    }
}

var mails = []


authorizeBtn.onclick = function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        createMailBtn.style.visibility = 'visible';
        signoutBtn.style.visibility = 'visible';
        authorizeBtn.innerText = 'Refresh';
        await listMessages();
        console.log(gapi.client.getToken())

    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

signoutBtn.onclick = function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        authorizeBtn.innerText = 'Sign In';
        signoutBtn.style.visibility = 'hidden';
        createMailBtn.style.visibility = 'hidden';
        var email = document.getElementById("Inbox");
        email.innerHTML = '';
    }
}


closeBtn.onclick = function () {
    sendMailSec.classList.add("hidden");
    $("#compose-to").value = '';
    $("#compose-subject").value = '';
    $("#compose-message").value = '';
    document.getElementById("file-input").value = "";
}


async function listMessages() {
    var request = gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'labelIds': 'INBOX',
        'maxResults': 30
    })

    request.execute(function (response) {
        var messages = response.result.messages;
        if (messages && messages.length > 0) {
            messages.forEach((message) => {
                var messageRequest = gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                })
                messageRequest.execute(appendMessageRow);
            });
        }
    })
}

function appendMessageRow(data) {
    console.log(data)
    let date = '';
    let from = '';
    let subject = '';
    for (let i in data.payload.headers) {
        if (data.payload.headers[i].name == "Date") {
            date = data.payload.headers[i].value;
        }
        if (data.payload.headers[i].name == "From") {
            from = data.payload.headers[i].value;
        }
        if (data.payload.headers[i].name == 'Subject') {
            subject = data.payload.headers[i].value;
        }
    }
    var tableBody = document.querySelector(".table-inbox tbody");

    var tr = document.createElement("tr");

    var tdFrom = document.createElement("td");
    tdFrom.textContent = from;

    var tdSubject = document.createElement("td");
    var link = document.createElement("a");
    link.target = "_blank";
    link.href = '"#message-modal-' + data.id;
    link.setAttribute("data-toggle", "modal");
    link.id = "message-link-" + data.id;
    link.textContent = subject;
    tdSubject.appendChild(link);

    var tdDate = document.createElement("td");
    tdDate.textContent = date;

    tr.appendChild(tdFrom);
    tr.appendChild(tdSubject);
    tr.appendChild(tdDate);

    tableBody.appendChild(tr);
    var body = document.querySelector("body");

    var divModal = document.createElement("div");
    divModal.className = "modal fade";
    divModal.id = "message-modal-" + data.id;
    divModal.setAttribute("tabindex", "-1");
    divModal.setAttribute("role", "dialog");
    divModal.setAttribute("aria-labelledby", "myModalLabel");

    var divModalDialog = document.createElement("div");
    divModalDialog.className = "modal-dialog modal-lg";

    var divModalContent = document.createElement("div");
    divModalContent.className = "modal-content";

    var divModalHeader = document.createElement("div");
    divModalHeader.className = "modal-header";

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "close";
    closeButton.setAttribute("data-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");
    closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';

    var h4ModalTitle = document.createElement("h4");
    h4ModalTitle.className = "modal-title";
    h4ModalTitle.id = "myModalLabel";
    h4ModalTitle.innerHTML = subject;

    var divModalBody = document.createElement("div");
    divModalBody.className = "modal-body";

    var iframeMessage = document.createElement("iframe");
    iframeMessage.id = "message-iframe-" + data.id;
    iframeMessage.srcdoc = "<p>Loading...</p>";

    divModalHeader.appendChild(closeButton);
    divModalHeader.appendChild(h4ModalTitle);
    divModalBody.appendChild(iframeMessage);
    divModalContent.appendChild(divModalHeader);
    divModalContent.appendChild(divModalBody);
    divModalDialog.appendChild(divModalContent);
    divModal.appendChild(divModalDialog);
    body.appendChild(divModal);

    document.getElementById("message-link-" + data.id).addEventListener("click", function () {
        var ifrm = document.getElementById("message-iframe-" + data.id).contentWindow.document;
        ifrm.body.innerHTML = getBody(data.payload);
    });
}

function getBody(message) {
    var encodedBody = '';
    if (typeof message.parts === 'undefined') {
        encodedBody = message.body.data;
    }
    else {
        encodedBody = getHTMLPart(message.parts);
    }
    encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

function getHTMLPart(arr) {
    for (var x = 0; x <= arr.length; x++) {
        if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
                return arr[x].body.data;
            }
        }
        else {
            return getHTMLPart(arr[x].parts);
        }
    }
    return '';
}

function composeTidy() {
    console.log("Đã gửi mail:");
    $('.loader').classList.add("hidden")
    alert("Đã gửi mail!");
    $("#compose-to").value = ''
    $("#compose-subject").value = ''
    $("#compose-message").value = ''
    document.getElementById("file-input").value = "";
    $('#send-button').classList.remove('disabled');
}



function sendEmail() {
    window.event.preventDefault();
    $('#send-button').classList.add("disabled");
    $('.loader').classList.remove("hidden")

    var recipient = $("#compose-to").value;
    var subject = $("#compose-subject").value;
    var message = $("#compose-message").value
    var fileInput = document.getElementById("file-input");
    var file = fileInput.files[0];

    console.log(file === undefined);

    if (!file) {
        var emailContent = {
            to: recipient,
            subject: subject,
            message: message
        };

        var email = '';

        email += 'To: ' + emailContent.to + '\r\n';
        email += 'Subject: ' + emailContent.subject + '\r\n';
        email += 'Content-Type: text/plain; charset="UTF-8"\r\n';
        email += '\r\n';
        email += emailContent.message;


        try {
            var encodedEmail = btoaUnicode(email).replace(/\+/g, '-').replace(/\//g, '_');
        } catch (error) {
            composeTidy();
            alert(error);

        }
        console.log(encodedEmail);

        gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'raw': encodedEmail
        }).then(function (response) {
            console.log('Email sent0:', response);
            composeTidy();
        }, function (error) {
            console.log('Error sending email0:', error);
        });
    }
    else {
        var reader = new FileReader();
        reader.onload = function () {
            var fileContent = reader.result.split(',')[1];
            console.log(fileContent)
            var boundary = 'boundary-example';

            var emailContent =
                'From: Your Name <your-email@example.com>\r\n' +
                'To: ' + recipient + '\r\n' +
                'Subject: ' + subject + '\r\n' +
                'Content-Type: multipart/mixed; boundary="' + boundary + '"\r\n' +
                '\r\n' +
                '--' + boundary + '\r\n' +
                'Content-Type: text/plain; charset="UTF-8"\r\n' +
                '\r\n' +
                message + '\r\n' +
                '\r\n' +
                '--' + boundary + '\r\n' +
                'Content-Type: ' + file.type + '; name="' + file.name + '"\r\n' +
                'Content-Disposition: attachment; filename="' + file.name + '"\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                fileContent + '\r\n' +
                '\r\n' +
                '--' + boundary + '--';

            try {
                var encodedEmail = btoaUnicode(emailContent).replace(/\+/g, '-').replace(/\//g, '_');
            } catch (error) {
                composeTidy();
                alert(error);

            }


            gapi.client.gmail.users.messages.send({
                'userId': 'me',
                'raw': encodedEmail
            }).then(function (response) {
                console.log('Email sent1:', response);
                composeTidy();
            }, function (error) {
                console.log('Error sending email1:', error);
            });
        };

        reader.readAsDataURL(file);
    }
}
function btoaUnicode(str) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
}