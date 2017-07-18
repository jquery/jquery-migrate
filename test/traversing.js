
QUnit.module( "traversing" );

QUnit.test( ".andSelf", function( assert ) {
    assert.expect( 1 );

    expectWarning( assert, "andSelf", function() {
        jQuery( "<div id='outer'><div id='inner'></div></div>" ).find( ".inner" ).andSelf();
    } );
} );
