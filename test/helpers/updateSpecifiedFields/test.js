const { expect, updateSpecifiedFieldsHelper, WObject, getRandomString } = require( '../../testHelper' );
const { AppendObject, ObjectFactory } = require( '../../factories/' );
const _ = require( 'lodash' );

describe( 'UpdateSpecifiedFieldsHelper', async () => {
    let wobject;

    before( async () => {
        wobject = await ObjectFactory.Create();
    } );
    describe( 'on "parent" field', () => {
        let fields;
        let updWobj;

        before( async () => {
            let { appendObject: field1 } = await AppendObject.Create( { name: 'parent', weight: 100 } );
            let { appendObject: field2 } = await AppendObject.Create( { name: 'parent', weight: 1 } );
            let { appendObject: field3 } = await AppendObject.Create( { name: 'parent', weight: -99 } );
            let { appendObject: field4 } = await AppendObject.Create( { name: 'parent', weight: 80 } );

            fields = [ field1, field2, field3, field4 ];
            await WObject.findOneAndUpdate( { author_permlink: wobject.author_permlink }, { fields: fields } );
            await updateSpecifiedFieldsHelper.update( field1.author, field1.permlink, wobject.author_permlink );
            updWobj = await WObject.findOne( { author_permlink: wobject.author_permlink } ).lean();
        } );

        it( 'should add field "parent" to wobject', async () => {
            expect( updWobj.parent ).to.exist;
        } );

        it( 'should write first field "parent"', async () => {
            expect( updWobj.parent ).to.eq( fields[ 0 ].body );
        } );


    } );

    describe( 'on "newsFilter" field', () => {
        let fields;
        let updWobj;
        let mockBody;

        before( async () => {
            mockBody = () => {
                // const kek = getRandomString(3);
                return JSON.stringify( {
                    allowList: [ [ 'a', 'b' ], [ 'c', 'd' ] ],
                    ignoreList: [ 'e', 'f', getRandomString( 3 ) ]
                } );
            };
            let { appendObject: field1 } = await AppendObject.Create( { name: 'newsFilter', body: ( mockBody() ), weight: 100 } );
            let { appendObject: field2 } = await AppendObject.Create( { name: 'newsFilter', body: ( mockBody() ), weight: 1 } );
            let { appendObject: field3 } = await AppendObject.Create( { name: 'newsFilter', body: ( mockBody() ), weight: -99 } );
            let { appendObject: field4 } = await AppendObject.Create( { name: 'newsFilter', body: ( mockBody() ), weight: 80 } );

            fields = [ field1, field2, field3, field4 ];
            await WObject.findOneAndUpdate( { author_permlink: wobject.author_permlink }, { fields: fields } );
            await updateSpecifiedFieldsHelper.update( field1.author, field1.permlink, wobject.author_permlink );
            updWobj = await WObject.findOne( { author_permlink: wobject.author_permlink } ).lean();
        } );

        it( 'should add field "newsFilter" to wobject', async () => {
            expect( updWobj.newsFilter ).to.exist;
        } );

        it( 'should write first field "newsFilter"', async () => {
            expect( updWobj.newsFilter ).to.deep.equal( JSON.parse( fields[ 0 ].body ) );
        } );


    } );

    describe( 'on "tagCloud" field', () => {
        let fields;
        let updWobj;
        let topFields;

        before( async () => {
            let { appendObject: field1 } = await AppendObject.Create( { name: 'tagCloud', weight: 100 } );
            let { appendObject: field2 } = await AppendObject.Create( { name: 'tagCloud', weight: 1 } );
            let { appendObject: field3 } = await AppendObject.Create( { name: 'tagCloud', weight: -99 } );
            let { appendObject: field4 } = await AppendObject.Create( { name: 'tagCloud', weight: 80 } );
            let { appendObject: field5 } = await AppendObject.Create( { name: 'tagCloud', weight: 50 } );
            let { appendObject: field6 } = await AppendObject.Create( { name: 'tagCloud', weight: 11 } );
            let { appendObject: field7 } = await AppendObject.Create( { name: 'tagCloud', weight: -120 } );

            fields = [ field1, field2, field3, field4, field5, field6, field7 ];
            topFields = [ field1, field2, field4, field5, field6 ];
            await WObject.findOneAndUpdate( { author_permlink: wobject.author_permlink }, { fields: fields } );
            await updateSpecifiedFieldsHelper.update( field1.author, field1.permlink, wobject.author_permlink );
            updWobj = await WObject.findOne( { author_permlink: wobject.author_permlink } ).lean();
        } );

        it( 'should add field "tagCloud" to wobject', async () => {
            expect( updWobj.newsFilter ).to.exist;
        } );

        it( 'should write first field "tagCloud"', async () => {
            expect( updWobj.tagClouds.map( ( item ) => {
                _.pick( item, [ 'author', 'permlink' ] );
            } ) ).to.deep.eq( topFields.map( ( item ) => {
                _.pick( item, [ 'author', 'permlink' ] );
            } ) );
        } );


    } );

    describe( 'on "rating" field', () => {
        let fields;
        let updWobj;
        let topFields;

        before( async () => {
            let { appendObject: field1 } = await AppendObject.Create( { name: 'rating', weight: 100 } );
            let { appendObject: field2 } = await AppendObject.Create( { name: 'rating', weight: 1 } );
            let { appendObject: field3 } = await AppendObject.Create( { name: 'rating', weight: -99 } );
            let { appendObject: field4 } = await AppendObject.Create( { name: 'rating', weight: 80 } );
            let { appendObject: field5 } = await AppendObject.Create( { name: 'rating', weight: 50 } );
            let { appendObject: field6 } = await AppendObject.Create( { name: 'rating', weight: 11 } );
            let { appendObject: field7 } = await AppendObject.Create( { name: 'rating', weight: -120 } );

            fields = [ field1, field2, field3, field4, field5, field6, field7 ];
            topFields = [ field1, field4, field5, field6 ];
            await WObject.findOneAndUpdate( { author_permlink: wobject.author_permlink }, { fields: fields } );
            await updateSpecifiedFieldsHelper.update( field1.author, field1.permlink, wobject.author_permlink );
            updWobj = await WObject.findOne( { author_permlink: wobject.author_permlink } ).lean();
        } );

        it( 'should add field "rating" to wobject', async () => {
            expect( updWobj.ratings ).to.exist;
        } );

        it( 'should write first field "rating"', async () => {
            expect( updWobj.ratings.map( ( item ) => {
                _.pick( item, [ 'author', 'permlink' ] );
            } ) ).to.deep.eq( topFields.map( ( item ) => {
                _.pick( item, [ 'author', 'permlink' ] );
            } ) );
        } );


    } );
} );