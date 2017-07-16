(function() {
	var base_url = "";

	function AxiomScript(src) {
		document.write('<script src="' + src + '" type="text/javascript" charset="utf-8"></script>');
	}

	function AxiomStyleSheet(src) {
		document.write('<link rel="stylesheet" type="text/css" href="' + src + '" />');
	}

	AxiomStyleSheet(base_url + '/api/ext/resources/css/ext-all.css');
//        AxiomStyleSheet(base_url + '/api/ext/resources/css/xtheme-vistablack.css');
	AxiomScript(base_url + '/api/ext/adapter/ext/ext-base.js');
	AxiomScript(base_url + '/api/ext/ext-all.js');
	AxiomScript(base_url + '/api/ext/ux-all.js');
	AxiomScript(base_url + '/api/ext/ext-lang-zh_CN.js');
	AxiomScript(base_url + '/api/jquery-1.3.2.js');

	AxiomScript(base_url + '/api/zion/zion-all.js');
	
	AxiomScript(base_url + '/api/axiom/ext-zion-all.js');
})();
