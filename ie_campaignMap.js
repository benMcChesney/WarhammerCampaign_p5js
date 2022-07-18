
class Point {
  constructor( x , y )
  {
    this.x = x;
    this.y = y; 
  }
}

let bg_image ; 

let table ; 
//let path ;
let paths = []; 
let turnNum = 0 ; 
let colors = [ '#43626F' , '#91322C', '#72A385' , '#B8BAB5' , '#151F18' , '#80A3B3' , '#CF6A63' , '#A9C7B4' , '#676963' , '#6D9C7B' ] ; 
let gui ; 
let svg ; 
let svg_image ; 
let path ; 
let xml ; 
let polygons = [] ;
function preload() {
  table = loadTable('assets/Fact_ARmyPath_IkitClawFaction_Test.csv', 'csv', 'header', this.load_csv_callback );
  xml = loadXML('../assets/ie_me_map - Copy.svg');

}

function load_csv_callback()
{
  loadData()
}
function setup() {
  createCanvas(1320 , 1080 ) ;
  
  bg_image = loadImage('assets/clean_mortal_empires 1.jpg');
  
  frameRate( 30 ) ; 
  
  let children = xml.getChildren('polygon');
  print('# children in XML ' , children );
  this.polygons = [];
  for (let i = 0; i < children.length; i++) 
  {
    //let id = children[i].getNum('id');
    let points_str = children[i].getString('points').replaceAll( ' ' , ',');
    let points = points_str.split( ',' )
    
    let poly_id = children[i].getString("id");
    let poly_title = children[i].getString("title");
    this.polygons.push( new Polygon( poly_id , poly_title ) ) ;
    this.polygons[i].loadVertices( points ) ; 
  }
}

let maxTurn = -1000 ; 
// Convert saved Bubble data into Bubble Objects
function loadData() {
  const pathData = table.getRows();
  // The size of the array of Bubble objects is determined by the total number of rows in the CSV
  const length = table.getRowCount();

  // first - get all the unique armies each of these will fit into a path 
  // table is in order of turn num 
  let names = []
  for (let i = 0; i < length; i++) {
    // Get position, diameter, name,
    //,locX,locY,
    let nameMap = pathData[i].getString("nameMapping_id");
    if ( names.includes(nameMap) == false )
    {
      names.push( nameMap);
      let path = new ArmyPath( paths.length , colors[ paths.length ] , nameMap );
      paths.push( path )
    }

    print('names are ' + names )
  }

  this.maxTurn = -1000 ; 
  // table is in order of turn num 
  for (let i = 0; i < length; i++) {

    let name = pathData[i].getString("nameMapping_id");
    let pathIndex = names.indexOf( name );
    
    let src_x = pathData[ i ].getNum("locX");
    let src_y = pathData[ i ].getNum("locY");
    const diameter = pathData[ i ].getNum("strength");
    //  add these to config somewhere or UI 
    let x = map( src_x , 0 , 667 , 10 , 1320 );
    let y = map( src_y , 0 , 545 , 1080 , 10 );
    
    let _turn = pathData[ i ].getNum("turn_num");
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



function draw() {

  let factor = 0.5 ; 
  //print( 'framecount ' + frameCount ) ; 
  let frameNormal = (( frameCount * factor ) % this.maxTurn ) / this.maxTurn ;   
  let turnNum = floor( frameNormal * this.maxTurn ) 

  let _scale = 1.0;
  push(); 

  background(0);
  
  fill(255);
  image(bg_image, 0, 0);
  //image(svg, 0 , 0, 1320, 1080 );
  fill(255, 215);
  push();
    scale( 0.6878 ); 
    for (let i = 0; i < this.polygons.length; i++) 
    {
      this.polygons[i].draw( )
    }

    push();
    scale( 0.6878 ); 
    for (let i = 0; i < this.polygons.length; i++) 
    {
      this.polygons[i].debugDraw( )
    }
  pop(); 


  pop(); 

  //image(svg_image, 0, 0, 1320, 1080);
  if ( paths.length > 0 )
  {
    for (let i = 0; i < paths.length-1 ; i++) 
    {
      
      //this.paths[ i ].draw( turnNum ,  this.maxTurn ) ;
      if ( paths[i] != null )
      {
        //print( '@ ' , i ); 
        paths[ i ].draw( turnNum , this.maxTurn ); 
        //paths[ i ].debugDraw( turnNum , this.maxTurn ); 
      }
      //this.paths[ i ].debugDraw( turnNum , this.maxTurn ); 
    }
  }

  //ellipse( mouseX, mouseY, 25 );
  //path.draw( frameCount ) ; 

  pop(); 

  
  textAlign(LEFT);
  textSize(16);
  fill(0)
  rect(0,0, 90 , 35 )
  fill( 255 )
  text("TURN " + turnNum, 10 , 20);
  
}