var DIALOG_NOTIFY = 1;
var DIALOG_YES_NO = 2;

var DialogBox = function DialogBox (message, type, w, h, yes_label, no_label, yes_callback, no_callback) {
    var that = this;
    this.message = message;
    this.type = type || DIALOG_NOTIFY;
    this.w = w || 500;
    this.h = h || 300;
    this.handle = "dialog-" + Math.random().toString(36).substr(2);
    this.yes_label = yes_label || "ok";
    this.no_label = no_label || "cancel";
    this.yes_callback = yes_callback || function(){that.close()};
    this.no_callback = no_callback || function(){that.close()};
};

DialogBox.prototype.open = function () {
    var html;
    html = "<div class = 'dialog' id='" + this.handle + "' style=' width: " + this.w + "px; height: " + this.h + "px;'><div class='button_row'>";
    
    switch (this.type) {
        case DIALOG_NOTIFY:
            html += "<button class='yes' id='yes-" + this.handle + "'>" + this.yes_label + "</button>";
            break;
        case DIALOG_YES_NO:
            html += "<button class='yes' id='yes-" + this.handle + "'>" + this.yes_label + "</button><button class='no' id='yes-" + this.handle + "'>" + this.no_label + "</button>";
    }

    html += "</div></div>";
    console.log(html);
    document.getElementById('dialog_container').innerHTML += html;
    
    document.getElementById('yes-' + this.handle) && (document.getElementById('yes-' + this.handle).onclick = this.yes_callback);
    document.getElementById('no-' + this.handle) && (document.getElementById('no-' + this.handle).onclick = this.no_callback);
}

DialogBox.prototype.close = function () {
    var element = document.getElementById(this.handle);
    element.parentNode.removeChild(element);
}

