
module( "traversing" );

test( ".andSelf", function( assert ) {
    assert.expect( 1 );

    expectWarning( "andSelf", function() {
        jQuery( "<div id='outer'><div id='inner'></div></div>" ).find( ".inner" ).andSelf();
    } );
} );
