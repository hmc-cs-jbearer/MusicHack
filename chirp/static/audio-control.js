function getNextSong() {
    $.getJSON($SCRIPT_ROOT + '/inc',
        {
            x : 5
        },
        function(data) {
            //$('input[name="jqtestlabel"]').value = data;
            $("#jqtestlabel").text(data.result);
        });
}