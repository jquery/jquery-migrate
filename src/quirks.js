
// jQuery has never supported or tested Quirks Mode

if ( document.compatMode === "BackCompat" ) {
	compatWarn( "jQuery is not compatible with Quirks Mode" );
}
