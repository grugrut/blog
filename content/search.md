+++
title = "Search"
date = 1900-01-01
draft = false
+++

### サイト内検索

<div id="search"></div>
<script>
    window.addEventListener('DOMContentLoaded', (event) => {
        new PagefindUI({ 
			element: "#search",
			showSubResults: true,
			showImages: false,
		});
    });
</script>
