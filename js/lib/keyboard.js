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
    return this.key_map[key];
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
        callback(that.keyboard_layout.get_key_location(e.keyCode));//.fromCharCode(e.keyCode)))
    };
}

KeyListener.prototype.set_layout = function (keyboard_layout) {
    this.keyboard_layout = keyboard_layout;
}

function decode_keys(string) {
    var string_arr = string.split("");
    var key_codes = [];
    for (var i =0; i<string_arr.length; i++) {
        key_codes.push(string_arr[i].toUpperCase().charCodeAt(0));
    }
    return key_codes;
}

var qwerty = new KeyboardLayout([decode_keys("1234567890"),
                                 decode_keys("qwertyuiop"),
                                 decode_keys("asdfghjkl").concat([186]),
                                 decode_keys("zxcvbnm").concat([188,190,191]),
                                 decode_keys(" ")]);

var qwertz = new KeyboardLayout([decode_keys("1234567890"),
                                 decode_keys("qwertzuiop"),
                                 decode_keys("asdfghjkl").concat([186]),
                                 decode_keys("yxcvbnm").concat([188,190,189]),
                                 decode_keys(" ")]);

var azerty = new KeyboardLayout([decode_keys("1234567890"),
                                 decode_keys("azertyuiop"),
                                 decode_keys("qsdfghjklm"),
                                 decode_keys("wxcvbn").concat([188,186,186,187]),//wtf two 186 ;:
                                 decode_keys(" ")]);