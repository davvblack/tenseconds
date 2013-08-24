var KeyboardLayout = function KeyboardLayout(rows_of_keys) {
    var i, j;
    this.rows_of_keys = rows_of_keys;
    console.log(rows_of_keys);
    this.key_map = {};
    for (i = 0; i < this.rows_of_keys.length; i++) {
        for (j = 0; j < this.rows_of_keys[i].length; j++) {
            this.key_map[this.rows_of_keys[i][j]] = [i,j];
        }
    }
    console.log(this.key_map);
}

KeyboardLayout.prototype.get_key_location = function (key) {
    return this.key_map[key.toLowerCase()];
}

var KeyListener = function KeyListener(keyboard_layout, callback) {
    this.keyboard_layout = keyboard_layout;
    if (callback) {
        this.set_listener(callback);
    }
}

KeyListener.prototype.set_listener = function (callback) {
    var that = this;
    document.onkeydown = function(e){
        callback(that.keyboard_layout.get_key_location(String.fromCharCode(e.keyCode)))
    };
}

var qwerty = new KeyboardLayout(["1234567890", "qwertyuiop", "asdfghjkl;", "zxcvbnm,./", " "]);