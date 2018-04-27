'use strict';

/**
 * @class provides a user with a set of tools to ease the process of creation an ajax request
 */
class Ajax{
    /**
     * Empty @constructor to initialize the component to allow to be reused many times
     */
    constructor(){};

    /**
     * @method creates, initializes XHR module with provided data and sends XHR request
     *
     * @param settings - accepts an object with custom settings for XHR module
     *      url: (relative or absolute destination path),
     *      [   method: 'GET' (default) | 'POST'    ],
     *      [   data: Object | JSON     ],
     *      [   async: false (default) | true   ]
     *
     *
     * @returns {*}
     *      false - if something went wrong
     *      Ajax - to allow further callbacks
     */
    send( settings ){

        if( !settings.url ) return false;
        if( !settings.method ) settings.method = 'GET';
        if( !settings.async ) settings.async = false;

        let fullurl = settings.url;

        if( settings.method === 'GET' && settings.data ){
            fullurl += '?';
            Object.keys(settings.data).map(function(param) {
                fullurl += `${param}=${encodeURIComponent(settings.data[param])}`;
            });
        }
        this.xhr = new XMLHttpRequest();
        this.xhr.open( settings.method , fullurl , settings.async );

        if(settings.method === 'POST') this.xhr.send( settings.data );
        else this.xhr.send();

        return this;
    }


    /**
     * @method calls the @function onDoneCallback() on XHR readystate DONE and status 200 or 304
     *
     * @param onDoneCallback - user provided function called on XHR state DONE and status 200 or 304
     * @returns {Ajax}
     *      Ajax - to allow further callbacks
     */
    done(onDoneCallback){
        if( this.xhr.readyState === 4 && ( this.xhr.status === 200 || this.xhr.status === 304 )) {
            onDoneCallback( JSON.parse( this.xhr.responseText ) );
        }

        return this;
    }

    fail(onFailCallback){
        if( !(this.xhr.readyState === 4 && ( this.xhr.status === 200 || this.xhr.status === 304 ))) {
            onFailCallback( "Oooops, something went wrong!" );
        }
    }
}

class DOM {
    constructor(){}

    createTable( data ){
        let table = document.createElement('table');

        let thead = document.createElement('thead');
        Object.keys(data[0]).forEach(function(key){
            let th = document.createElement('th');
            th.innerText = key;
            thead.appendChild(th);
        });
        table.appendChild(thead);

        data.forEach(function(row){
            let tr = document.createElement('tr');
            Object.keys(row).map(function(rowKey) {
                let td = document.createElement('td');
                td.innerText = row[rowKey];
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        return table;
    }

    generateSuccessLabel( count , time = 0 ){
        let label = document.createElement('div');
        label.classList.add('result-success');
        label.appendChild(this.createIco('ok'));
        label.appendChild(this.createSpan( `Record count: ${count};` ));
        label.appendChild(this.createSpan( `Execution time: ${time}ms;` ));
        label.appendChild(this.createSpan( this.assignId( this.createA( 'View Execution Plan' , '#' ) , 'exec_plan' ) ));
        return label;
    }

    generateFailedLabel( err , details ){
        // TODO: create generator for failed label
        let label = document.createElement('div');
        label.classList.add('result-success');
        label.appendChild(this.createIco('fail'));
        return label;
        /*
        PROTOTYPE
        <div class="result-fail">
            <div class="fb fb-fail"></div>
            <span>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</span>
        </div>
        * */
    }

    generateTableDetails( name , details ){
/*
<div id="" class="hidden">
    <details>
        <summary><span id=""> ${ ... } </span> <span id=""> ${ ... } </span></summary>
        <ul>
            <li><span id=""> ${ ... } </span>: <span id="" class="tbl-fld-details"> ${ ... } </span></li>
            <li><span id=""> ${ ... } </span>: <span id="" class="tbl-fld-details"> ${ ... } </span></li>
        </ul>
    </details>
</div>
*/
        let t = this;
        let dom_details = document.createElement('details');
        let summary = document.createElement('summary');
        summary.innerText = name;
        let ul = document.createElement('ul');
        Object.keys(details).map(function(detail){
            let li = document.createElement('li');
            li.appendChild( t.createSpan( details[detail] ) );
            ul.appendChild( li );
        });

        dom_details.appendChild(summary);
        dom_details.appendChild(ul);

        return dom_details;
    }

    createIco( type){
        let ico = document.createElement('div');
        ico.classList.add('fb');
        switch (type){
            case 'ok':
                ico.classList.add('fb-ok');
                break;
            case 'fail':
                ico.classList.add('fb-fail');
                break;
            default:
                ico.classList.add('fb-fail');
        }

        return ico;
    }

    createSpan( content = '' ){
        let span = document.createElement('span');
        if(content) {
            if (typeof content === 'object') {
                span.appendChild(content);
            } else {
                span.innerText = content;
            }
        }
        return span;
    }

    createA( title , href ){
        let a = document.createElement('a');
        a.innerHTML = title;
        a.href = href;
        return a;
    }

    assignId( element , id ){
        element.id = id;
        return element;
    }
}

class ErrorHandler {
    constructor(){}
}

class QueryParser {
    constructor(){}

    parse( query ){

        let parsed = {};

        ajax.send({
            url: 'https://my-json-server.typicode.com/averkoc/demo/example1',
            method: 'GET',
            async: false
        }).done( function( data ){
            let directives = {};

            if( !query ){
                return false; // TODO: ErrorHandler
            }

            let bait = ['from', 'select'];

            if(query.indexOf(bait[0]) !== -1){
                let from = query.indexOf(bait[0])+bait[0].length;
                let length = query.indexOf(';') - from;
                let buff = query.substr( from , length ).trim();

                // spike-nail for "advanced" rest api =)
                if(buff !== 'students'){
                    return false; // TODO: ErrorHandler
                }else{
                    directives.from = 'students';
                }
            }else{
                return false; // TODO: ErrorHandler
            }

            if( query.indexOf(bait[1]) !== -1){
                let select = query.indexOf(bait[1])+bait[1].length+1; // length of select (7), one reserved for space
                let length = query.indexOf(bait[0]) - select;
                let fields = query.substr(select, length).split(',');

                let pre_fields = tp.getDetails( data );

                let state = true;
                Object.keys(fields).map(function(field){
                    fields[field] = fields[field].trim();
                    let flag = false;

                    if(fields[field] === '*'){
                        flag = true;
                    }else{
                        Object.keys(pre_fields).map(function(pre_field){
                            if(fields[field] === pre_fields[pre_field]){
                                flag = true;
                            }
                        });
                    }

                    if(state){
                        if(!flag) state = false;
                    }
                });

                if(state){
                    directives.select = fields;
                }else{
                    // TODO: ErrorHandler
                    return false;
                }
            }
            parsed = directives;
        });

        return (Object.keys(parsed).length === 0 && parsed.constructor === Object) ? false : parsed;
    }

    applyPattern( data , pattern ){
        let flagAll = false;
        let refinedData = [];

        Object.keys(pattern.select).map(function(key){
            if(pattern.select[key] === '*'){
                flagAll = true;
            }
        });

        if(flagAll) {
            return data;
        } else {
            data.forEach(function(el){
                let row = {};
                Object.keys(el).map(function(key){
                    Object.keys(pattern.select).map(function(selector){
                        if(key === pattern.select[selector]){
                            row[key] = el[key];
                        }
                    });

                });
                refinedData.push(row);
            });
            return refinedData;
        }
    }
}

class TableParser {
    constructor(){}

    getDetails( data ){
        // TODO-later: To be updated when dealing with real table
        let keys = [];
        Object.keys(data[0]).forEach(function(key){
            keys.push(key);
        });
        return keys;
    }
}

const ajax = new Ajax();
const dom = new DOM();
const qp = new QueryParser();
const tp = new TableParser();

window.onload = function(){
    initTableLists();
    initAllBehaviors();
};

function initTableLists(){
    ajax.send({
        url: 'https://my-json-server.typicode.com/averkoc/demo/example1',
        method: 'GET',
        async: false
    }).done( function( data ){
        let tbl_holder = document.getElementById('tbl-holder');
        tbl_holder.appendChild( dom.generateTableDetails( 'students' , tp.getDetails( data ) ));
    }).fail( function( data ){
        console.error( data );
    });
}


/**
 * @function to initialize all action behaviors on the page
 * @return Boolean
 *      True
 *      False
 */
function initAllBehaviors(){

    // Tab manipulations
    document.querySelectorAll('.tab').forEach(function(el, i, ar){
        el.addEventListener('click', function(ev){
            // TODO-later: Display content of selected DB
            alert( "Under construction..." );
            // ar.forEach(function(el){
            //     if(el.classList.contains('active')) el.classList.remove('active');
            // });
            // ev.target.classList.add('active');
        });
    });

    // Run script - control button
    document.getElementById('run-script').addEventListener('click', function(){
        let res = document.getElementById( 'response' );
        res.innerHTML = '';

        let query = document.getElementById('query').value;

        if(!query) query = "select * from students;";

        query = query.trim();
        if( query[query.length-1] !== ';' ) query += ';';

        let pattern = qp.parse( query );
        if(!pattern) return;

        ajax.send({
            url: 'https://my-json-server.typicode.com/averkoc/demo/example1',
            method: 'GET',
            data: {"querytext": query},
            async: false
        }).done( function( data ){

            data = qp.applyPattern( data , pattern );

            res.appendChild( dom.generateSuccessLabel(data.length) );
            res.appendChild( dom.createTable(data) );

            initBehavior( 'exec_plan' );
        }).fail( function( data ){
            // TODO: GenerateFailedLabel()
            let error = "SOME XHR ERROR!";
            res.appendChild( dom.generateFailedLabel( error ) );
        });
    });

    // reset option
    document.getElementById('reset').addEventListener('click', function(){
        document.getElementById('response').innerHTML = '';
        document.getElementById('query').value = 'This version of "SQL Observer" allows user to select which field of the table should be displayed as the result.\n\n' +
            'This version is case sensetive, so all directives MUST be in lower case.\n\n' +
            'Also "SQL Observer" can display all the data using usual syntax as follow: select * from students\n\n' +
            'Keep in mind that due to restrictions of task user can operate only with "students" table, attempts to use other tables will be denied.\n\n\n' +
            'Try this examples:\n\n\n' +
            'select * from students\n\n' +
            'select StudentID, LastName, FirstName from students\n\n' +
            'select LastName, DP, StartYear from students\n\n' +
            'select LastName, City from students';
    });

    document.getElementById('save').addEventListener('click', function(){
        alert( "Under construction..." );
    });

    document.getElementById('share').addEventListener('click', function(){
        alert( "Under construction..." );
    });


    //tbl-smp-init
    document.getElementById('tbl-smp-init').addEventListener('click', function(){
        let tbl_smp = document.getElementById('tbl-smp-data');
        tbl_smp.classList.contains('hidden') ? tbl_smp.classList.remove('hidden') : tbl_smp.classList.add('hidden');
    });

    return true;
}

function initBehavior( id ){
    document.getElementById(id).addEventListener('click', function(){
        alert( 'Under construction...' );
    });
}

