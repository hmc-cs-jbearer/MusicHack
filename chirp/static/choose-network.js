function chooseNetwork(nid, uid) {
	 $.getJSON($SCRIPT_ROOT + '/choose-network',
        {
            nid : nid,
            uid : uid
        },
        function(data) {
        	location.reload();
        });
}