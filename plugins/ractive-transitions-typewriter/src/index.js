const PROPS = [
	'width',
	'height',
	'visibility'
];

// TODO differentiate between intro and outro
export default function typewriter ( t, params ) {
	var interval, currentStyle, hide;

	params = t.processParams( params );

	// Find the interval between each character. Default
	// to 4 milliseconds
	interval = params.interval || (
		params.speed ? 1000 / params.speed :
			( params.duration ? t.node.textContent.length / params.duration :
				4
			)
		);

	currentStyle = t.getStyle( props );

	hide = function ( node ) {
		var children, i, computedStyle;

		if ( node.nodeType === 1 ) {
			node._style = node.getAttribute( 'style' );
			computedStyle = window.getComputedStyle( node );
			node._display = computedStyle.display;
			node._width = computedStyle.width;
			node._height = computedStyle.height;
		}

		if ( node.nodeType === 3 ) {
			node._hiddenData = '' + node.data;
			node.data = '';

			return;
		}

		children = Array.prototype.slice.call( node.childNodes );
		i = children.length;
		while ( i-- ) {
			hide( children[i] );
		}

		node.style.display = 'none';
	};

	if ( t.isIntro ) {
		hide( t.node );
	}

	setTimeout( function () {
		// make style explicit...
		t.setStyle( currentStyle );

		typewriteElement( t.node, t.isIntro, t.complete, interval );
	}, params.delay || 0 );
}

function typewriteElement ( node, isIntro, complete, interval ) {
	if ( node.nodeType === 1 && isIntro ) {
		node.style.display = node._display;
		node.style.width = node._width;
		node.style.height = node._height;
	}

	if ( node.nodeType === 3 ) {
		typewriteTextNode( node, isIntro, complete, interval );
		return;
	}

	let children = Array.prototype.slice.call( node.childNodes );
	const method = isIntro ? 'shift' : 'pop';

	function next () {
		if ( !children.length ) {
			if ( node.nodeType === 1 && isIntro ) {
				if ( node._style ) {
					node.setAttribute( 'style', node._style );
				} else {
					node.getAttribute( 'style' );
					node.removeAttribute( 'style' );
				}
			}

			complete();
			return;
		}

		typewriteElement( children[ method ](), isIntro, next, interval );
	}

	next();
}

function typewriteTextNode ( node, isIntro, complete, interval ) {
	var str, len, loop, i, d, targetLen;

	// text node
	str = isIntro ? node._hiddenData : '' + node.data;
	len = str.length;

	if ( !len ) {
		complete();
		return;
	}

	i = isIntro ? 0 : len;
	d = isIntro ? 1 : -1;
	targetLen = isIntro ? len : 0;

	loop = setInterval( function () {
		var substr, remaining, match, remainingNonWhitespace, filler;

		substr = str.substr( 0, i );
		remaining = str.substring( i );

		match = /^\w+/.exec( remaining );
		remainingNonWhitespace = ( match ? match[0].length : 0 );

		// add some non-breaking whitespace corresponding to the remaining length of the
		// current word (only really works with monospace fonts, but better than nothing)
		filler = new Array( remainingNonWhitespace + 1 ).join( '\u00a0' );

		node.data = substr + filler;
		if ( i === targetLen ) {
			clearInterval( loop );
			delete node._hiddenData;
			complete();
		}

		i += d;
	}, interval );
}
