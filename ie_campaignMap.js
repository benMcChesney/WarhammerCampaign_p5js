function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// https://stackoverflow.com/questions/30970648/changing-hex-codes-to-rgb-values-with-javascript
function hexToRgb(hexColor) {
  
  let obj = [ 255 , 0 , 0 ] ; 
  let c = hexColor.toLowerCase() ; 
  if(/^#([a-f0-9]{3}){1,2}$/.test(c))
  {
    if(c.length== 4)
    {
        c= '#'+[c[1], c[1], c[2], c[2], c[3], c[3]].join('');
    }
    c= '0x'+c.substring(1);
    obj = [ (c>>16)&255 , (c>>8)&255 , c&255 ]; 
    //return 'rgb('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+')';
  }
  let color = {};
  color.r = obj[0] ; 
  color.g = obj[1] ; 
  color.b = obj[2] ; 
  print( `from ${hexColor} -> ${color.r},${color.g},${color.b}`);
  return color ; 
  //return '';
}

//https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript

function generateShadesFromColor( hexColor , numShades )
{
  let hexColors = [ hexColor ] ; 
  let unitShades = Math.ceil( numShades / 2.0 ) ; 
  // darker colors  
  for ( let i = numShades ; i > unitShades ; i-- )
  {
  let perc = i / numShades ; 
  var bigint = parseInt(hexColor, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  //let __c = hexToRGB( hexColor )
  r = r * perc ; 
  g = g * perc ; 
  b = b * perc ; 
  let shadeHex = rgbToHex( r , g , b ) ; 
  hexColors.push( shadeHex ); 
  }
  
  /*
  // lighter colors 
  for ( let i = (numShades + unitShades) ; i > numShades ; i-- )
  {
  let perc = i / numShades ; 
  var bigint = parseInt(hexColor, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  r = r * perc ; 
  g = g * perc ; 
  b = b * perc ; 
  let shadeHex = rgbToHex( r , g , b ) ; 
  hexColors.push( shadeHex ); 
  /*
  r = r * (1.0 + perc) ; 
  g = g * (1.0 + perc ); 
  b = b * (1.0 + perc ); 
  */
  //}
  print( hexColors )
  return hexColors ; 
  
}

class Point {
  constructor( x , y )
  {
    this.x = x;
    this.y = y; 
  }
}

let colorUtils = new ColorUtils(); 

let bg_image ; 
let table ; 
//let path ;
let paths = []; 
let turnNum = 0 ; 
let palette = [ '#43626F' , '#91322C' ] //, '#72A385' , '#B8BAB5' , '#151F18' ] ;

let gui ; 
let svg ; 
let svg_image ; 
let path ; 
let xml ; 
let maxTurn = -1000 ; 
let polygons = [] ;

let tableRegions ;
let regionHistory = [] ;  

let tableFactions ; 
let factions = [] ; 


  function preload() {
    //let armyPathCSV = 'assets/Fact_ARmyPath_IkitClawFaction_Test.csv';
    let armyPathCSV = 'assets/Fact_ArmyPath.csv';
    let factControlCSV = '../assets/Fact_SettlementControlChange_all.csv' ;
    let dimFactionsCSV = '../assets/Dim_Factions.csv' ;
    let svgPath = '../assets/ie_me_map - Copy.svg';

    xml = loadXML(svgPath);

    tableFactions = loadTable( dimFactionsCSV , 'csv' , 'header' , this.load_csv_callback_factions ) ;
    table = loadTable( armyPathCSV , 'csv', 'header', this.load_csv_callback_paths );
    tableRegions = loadTable( factControlCSV , 'csv' , 'header' , this.load_csv_callback_settlement ) ;
  }

  function load_csv_callback_settlement()
  {
    const regionData = tableRegions.getRows();
    const length = tableRegions.getRowCount();
    this.regionHistory = [] ; 

    print('loaded ' + length + ' rows for settlement changes');
    // first - get all the unique armies each of these will fit into a path 
    // table is in order of turn num 
    for (let i = 0; i < length; i++) 
    {
      let obj = {};
      let bMatchFound = false ; 
      try 
      {
        obj.settlementId = regionData[i].getString( 'settlement_name') ;

        
        for ( let r = 0 ; r < this.regionHistory.length ; r++ )
        {
          let rh = this.regionHistory[r] ; 
          if( rh.settlementId == obj.settlementId )
          {
            bMatchFound = true ; 
            print('duplicate region @ ' , rh.settlementId  )
            //break ; 
          }
        }

        obj.settlementOwnerName = regionData[i].getString( 'settlement_owner') ;
        obj.settlementFactionId = regionData[i].getString( 'factionId') ;
        obj.settlementFactionType = regionData[i].getString( 'factionType' );
        obj.minTurn = regionData[i].getNum( 'validFrom');
        obj.maxTurn = regionData[i].getNum( 'validTo');
        //if ( obj.settlementId == 'wh2_main_vampire_coast_pox_marsh'
        //  || obj.settlementId == 'wh2_main_vampire_coast_the_blood_swamps' )
        //{
        //if ( this.regionHistory.length < 250 )
        //{
          this.regionHistory.push( obj );
          print( `adding ${obj.settlementId} : ${obj.settlementOwnerName} | ${obj.minTurn} <-> ${obj.maxTurn}`); 
        //}
      }
      catch ( error )  
      {
        print( 'ERROR ' ,  error ) ; 
      }
      //if ( obj.settlementId != null && bMatchFound == false )
      //{
        //this.regionHistory.push( obj );
        //print( `adding ${obj.settlementId} : ${obj.settlementOwnerName} | ${obj.minTurn} <-> ${obj.maxTurn}`); 
      //}
    }
  }

  function load_csv_callback_factions()
  {
    const factionData = tableFactions.getRows();
    const length = tableFactions.getRowCount();
    this.factions = [] ; 

    print('loaded ' + length + ' rows for factions');
    for (let i = 0; i < length; i++) 
    {
      let obj = {};
      obj.Id = factionData[i].getNum( 'id') ;
      obj.factionNK = factionData[i].getString( 'faction_nk' ) ; 
      obj.factionId = factionData[i].getNum( 'id')
      obj.factionType = factionData[i].getString( 'factionType' ); 
      let colorHex =  '#' + Math.floor(Math.random()*16777215).toString(16);
      let colorRGB = hexToRgb( colorHex ); 

      obj.color = colorRGB ; 
      //obj.colorHex = colorHex ; 
      
      if ( obj.factionNK != null )
      {
        this.factions.push( obj );
        //print( obj.colorHex ); 
        //print( `adding a faction ${obj.factionNK} with color (${obj.color.r},${obj.color.g},${obj.color.b}`);
        //print( `${obj.factionNK} with (${colorRGB.r},${colorRGB.g},${colorRGB.b})`);
      }
    }
  }

  function getFactionById ( factionId ) 
  {
    if ( this.factions.length == 0 )
    {
      //print( 'factions.length == 0 !')
      return 0 ; 
    }
    for ( let i = 0 ; i < this.factions.length ; i++ )
    {
      let a = this.factions[i].factionId  ;
      let b = factionId ;  
      //print( `checking if ${a} == ${b} ? ${ a == b }`);
      if ( a == b )
      {
        return i ; 
      }
    }

    return -1 ; 
  }
  function load_csv_callback_paths()
  {
    const pathData = table.getRows();
    const length = table.getRowCount();

    // first - get all the unique armies each of these will fit into a path 
    // table is in order of turn num 
    let names = []
    let pathColors = [] ; 

    for ( let p = 0 ; p < palette.length ; p++ )
    {
      //generatedColors = generateShadesFromColor( palette[ p ] , 4 ) ;
      //pathColors.push( generatedColors ); 
    }
    for (let i = 0; i < length; i++) {
      // Get position, diameter, name,
      //,locX,locY,
      let nameMap = pathData[i].getString("nameMappingId");
      let factionIdValue = pathData[i].getNum( "faction_id");
      let factionIndex = getFactionById( factionIdValue ) ;
      if ( pathColors.length == 0 )
      {
        
        print( 'factionIndex is ', factionIndex);
        let factionHexColor = this.factions[ factionIndex ].hexColor ;  
        pathColors = generateShadesFromColor( factionHexColor , 16 ) ; 
      }
      let namesLength = names.length ; 
      if ( names.includes(nameMap) == false )
      {
        names.push( nameMap);
        
        let color = "#FFCCAA"
        //if ( namesLength > pathColors.length-1 )
        //{
          color = hexToRgb( '#' + Math.floor(Math.random()*16777215).toString(16) ) ;
          //print('random color for path ', color );
        /*}
        else
        {
          
          color = pathColors[ namesLength ];
          print( 'match color found' , color ) 
          let toRGB = hexToRgb( color ); 
          print( toRGB ); 
        }*/
        let path = new ArmyPath( paths.length , color , nameMap );
        paths.push( path )
      }

      //print('names are ' + names )
    }

    this.maxTurn = -1000 ; 
    // table is in order of turn num 
    for (let i = 0; i < length; i++) {

      //strength,locX,locY,turn_num,nameMappingId,faction_nk,faction_id,minTurnNum,maxTurnNum,turnsDuration
      let name = pathData[i].getString("nameMappingId");
      let pathIndex = names.indexOf( name );
      
      let src_x = pathData[ i ].getNum("locX");
      let src_y = pathData[ i ].getNum("locY");
      const diameter = pathData[ i ].getNum("strength");
      //  add these to config somewhere or UI 
      let x = map( src_x , 0 , 667 , 10 , 1320 );
      let y = map( src_y , 0 , 545 , 1080 , 10 );
      
      let _turn = pathData[ i ].getNum("turn_num") - 1;
      // Put object in array
      paths[ pathIndex ].add_vertex( x, y, diameter, _turn );
      if ( _turn > this.maxTurn )
      {
        this.maxTurn = _turn ; 
      }
    }

    print( "maxTurn is "+ this.maxTurn );
    for (let i = 0; i < paths.length ; i++) 
    {
      paths[ i ].align_and_sort_vertices( this.maxTurn ) ; 
    }
  }
  function setup() 
  {
    print( 'calling setup!');
    createCanvas(1320 , 1080 ) ;
    this.turnNum = 1 ; 
    bg_image = loadImage('assets/clean_mortal_empires 1.jpg');
    
    frameRate( 30 ) ; 
    
    let children = xml.getChildren('polygon');
    //print('# children in XML ' , children );
    this.polygons = [];
    for (let i = 0; i < children.length; i++) 
    {
      //let id = children[i].getNum('id');
      let points_str = children[i].getString('points').replaceAll( ' ' , ',');
      let points = points_str.split( ',' )
      
      let poly_id = children[i].getString("id");
      let poly_replace = poly_id ; 
      if ( poly_id == null || poly_id.indexOf( '_' ) == -1 )
      {
        print( 'ignoring ' , poly_id );
      }
      else
      {
        poly_replace = poly_replace.replaceAll( 'x5F_' , '' );
        poly_replace = poly_replace.replaceAll( ' ' , '' );
      }
      let poly_title = children[i].getString("title");
      this.polygons.push( new Polygon( poly_replace , poly_title ) ) ;
      this.polygons[i].loadVertices( points ) ; 
    }

    let skryreIndex = getFactionById( 337 ) ; 
    if ( skryreIndex != -1 )
    {
      let a = this.factions[ skryreIndex ]; 
      print('heyyyy ')
      //let palette = [ '#43626F' , '#91322C', '#72A385' , '#B8BAB5' , '#151F18' ] ;

      this.factions[ skryreIndex ].hexColor ='#151F18' ; 
      this.factions[ skryreIndex ].color = hexToRgb('#151F18') ; 
    }
  }

  function draw() 
  {

    let factor = 0.25 ; 
    //print( 'framecount ' + frameCount ) ; 
    let frameNormal = (( frameCount * factor ) % this.maxTurn ) / this.maxTurn ;   
    let turnNum = floor( frameNormal * this.maxTurn ) ; 

    if (mouseIsPressed) {
      let nX = floor( map( mouseX , 0 , bg_image.width , 1 , this.maxTurn ) ) ; 
      this.turnNum = nX ; 
    }
    check_regions( this.turnNum );
    let _scale = 1.0;
    push(); 

    background(0);
    
    fill(255);
    color( 255 , 255 , 255 , 255 );
    image(bg_image, 0, 0);
    fill(255, 215);
    push();
      scale( 0.6878 ); 
      for (let i = 0; i < this.polygons.length; i++) 
      {
        this.polygons[i].draw( )
      }
  
      //for (let i = 0; i < this.polygons.length; i++) 
      //{
      //  this.polygons[i].debugDraw( )
      //}
    pop();
    if ( paths.length > 0 )
    {
      for (let i = 0; i < paths.length-1 ; i++) 
      {
        if ( paths[i] != null )
        {
          paths[ i ].draw( this.turnNum , this.maxTurn ); 
        }

      }
    }
    pop(); 

    textAlign(LEFT);
    textSize(16);
    fill(0)
    rect(0,0, 120 , 35 )
    fill( 255 )
    text( `TURN ${this.turnNum}/${this.maxTurn}`, 10 , 20);
    
  }


  function check_regions( turnNum )
  {
    
    //if ( this.regionHistory.length > 0 )
    //{
      for (let i = 0; i < this.polygons.length; i++) 
      {
        //print( 'checking polygons')
        let regionPolyColor ; 
        //print( 'valid faction!') 
        let poly_id = this.polygons[i].id ; 
        let isActive = false ; 
        //print( 'checking ' , this.polygons[i].id );
        if ( poly_id != null )
        {
          for (let r = 0; r < this.regionHistory.length; r++) 
          {
           //first get the match from the snapshot
            if ( this.regionHistory[r].settlementId == poly_id )
            {
              //print( `${poly_id} found match!` );
              if ( this.regionHistory[r].minTurn <= turnNum 
                  && this.regionHistory[r].maxTurn >= turnNum )
                {
                  isActive = true ; 
                  //print('active!')
                  // set this on a 1x lookup for speed 
                  // nope! this fucks it up every time 
                  
                  //if ( this.regionHistory[r].polygonColor == null )
                  //{
                    for ( let a = 0 ; a < this.factions.length ; a++ )
                    {
                      
                      let a_faction = this.factions[a].factionId  ; 
                      let b_faction = this.regionHistory[r].settlementFactionId ;
                      //print(`does ${a_faction} == ${b_faction} ?`);
                      if ( a_faction == b_faction )
                      {
                        
                        //print( 'skaven match! ' ,  this.factions[a].color  );
                        //print ( `@ ${turnNum}, ${b_faction} owns ${this.regionHistory[r].settlementId} ${this.regionHistory[r].minTurn} <-> ${this.regionHistory[r].maxTurn} `)
                        let _color = this.factions[a].color ; 
                        this.regionHistory[r].polygonColor = _color ; 
                         
                        regionPolyColor = this.factions[a].color ; 
                        this.polygons[i].color = regionPolyColor ;
                      }
                    }
                  //}
                  //else
                  //{
                  //  regionPolyColor = this.regionHistory[r].polygonColor ; 
                  //}
                  //print( `${poly_id} should be active!` )
                }
            }
          }
        }
        

      if ( isActive == true )
      {
        
        
        this.polygons[i].alpha = 235 ;
        //this.polygons[i].hexColor = regionPolyHex ; 
        /*
        if ( regionPolyHex != null)
        {
          let _hex = regionPolyHex.replaceAll('#', '');

          var bigint = parseInt(_hex, 16);
          this.polygons[i].color.r = (bigint >> 16) & 255;
          this.polygons[i].color.g = (bigint >> 8) & 255;
          this.polygons[i].color.b = bigint & 255;
          print( `rgb (${this.polygons[i].color.r} , ${this.polygons[i].color.g}, ${this.polygons[i].color.b} )`)
        }
        */
      
      }
      else
      {
        //this.polygons[i].alpha = 125 ; 
        //this.polygons[i].color.r = 15 ;
        //this.polygons[i].color.g = 15;
        //this.polygons[i].color.b = 15;
        //this.polygons[i].color.r = 255 ; 
        //this.polygons[i].color.g = 255 ;
        //this.polygons[i].color.b = 255 ;
      }
    //}
  }
}
