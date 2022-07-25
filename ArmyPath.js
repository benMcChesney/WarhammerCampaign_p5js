
// ArmyPath class
class ArmyPath {
  constructor( id , color , name ) {
    //this.path_array = path_array;
    //this.name = name;
    this.over = false;
    this.vertices = [];
    this.radius = [];
    this.turns = [];
    this.obj_array = [] 
    this.frameNormal = 0 ;
    this.id = id ;  
    this.name = name ; 
    this.color = color ;
    print('army path color is ' , color ) ; 
  }

  add_vertex( x , y , radius , turn_num )
  {
    this.vertices.push( new Point( x , y ))
    this.radius.push( radius );
    this.turns.push( turn_num ) ;
  }

  align_and_sort_vertices( maxTurn )
  {
    let verts = this.vertices ; 
    //let max_turn = Math.max( this.turns );

    for ( let i = 0 ; i < maxTurn ; i++ )
    {
      let data = {} ; 
      let matchIndex = this.turns.indexOf( i );  
      //print( `does turns include ${i} ? ${matchIndex}` ) ; 
      if( matchIndex != -1 ) 
      {
        data.x = this.vertices[ matchIndex ].x ;
        data.y = this.vertices[ matchIndex ].y ; 
        data.radius =  this.radius[ matchIndex ] ; 
        data.turn = i ;  
        //print('adding real vertex at ['+this.id+"]" , i )
      }
      else{
        data.x = 1 ; 
        data.y = 1 ; 
        data.radius = 5 ; 
        data.turn = i ;  
        //print('adding default vertex at ['+this.id+"]" , i )
      }
      
   
      this.obj_array.push( data );
      //this.vertices = [];
      //this.radius = [];
      //this.turns = [];
    }
  }
  /*
  // Check if mouse is over the bubble
  rollover(px, py) {
    let d = dist(px, py, this.x, this.y);
    this.over = d < this.radius;
  }*/

  debugDraw( frameCount , maxTurn ) 
  {
    color(255)
    stroke(255);
    fill(235);
    //print( "@ debug draw , length is " , this.obj_array.length );
    for (let i = 0; i < this.obj_array.length-1 ; i++) 
    {
      //print( "@ debug draw " , i )
      let obj = this.obj_array[ i ];
      circle( obj.x , obj.y , 10 )
    }

  }

  draw( frameCount , maxTurn ) {

    if ( this.color.r != null )
    {
      fill(this.color.r , this.color.g , this.color.b );
      color(this.color.r , this.color.g , this.color.b );
    }
    else ( this.color != null )
    {
      fill( this.color );
      color( this.color );
    }
    stroke(this.color);
    
    let tail = 15 ; 
    let frameNormal = ( frameCount % maxTurn ) / maxTurn ;   
    let tailStartIndex = floor( frameNormal * maxTurn ) 
    let tailEndIndex = tailStartIndex - tail ; 
    
    if (tailEndIndex < 1 )
    {
      tailEndIndex = 1 ; 
    }

    //print( 'start: '  + tailStartIndex + '  - end: ' + tailEndIndex )
    for (let i = tailStartIndex; i >= tailEndIndex; i-- ) 
    {
        
        // Get position, diameter, name,
        let d = dist(
            this.obj_array[ i - 1 ].x 
            , this.obj_array[ i - 1 ].y
            , this.obj_array[ i ].x 
            , this.obj_array[ i ].y
        );
        //print( "distance " + d + " | " +    this.obj_array[ i - 1 ].x + " <-> " +    this.obj_array[ i ].x );
        let strength_delta = ( this.obj_array[ i ].radius - this.obj_array[ i - 1 ].obj_array ) /  this.obj_array[ i - 1 ].obj_array ; 
        
        strokeWeight( map ( this.obj_array[ i ].radius , 0 , 20000 , 3, 10));

        // if a large position jump AND loss of most unit strength - then we assume army lost
        if ( d < 100  ) //&& strength_delta <= .5 )
        {
        line( this.obj_array[ i - 1 ].x 
            , this.obj_array[ i - 1 ].y
            , this.obj_array[ i ].x 
            , this.obj_array[ i ].y );
        }
    }

  }
}
