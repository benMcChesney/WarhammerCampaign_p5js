
class Polygon {
    constructor(id , title )
    {
      this.points = [] ; 
      this.id = id ; 
      this.title = title ; 
    }
  
    loadVertices( arr )
    {
      this.points = [] ; 
      let sumX = 0 ; 
      let sumY = 0 ;
      
  
      let skip = 2 ; 
      for ( let i = 0 ; i < arr.length ; i+=(2*skip) )
      {
        let p = new Point( arr[i] , arr[ i + 1 ] );
        this.points.push( p );
        sumX += arr[ i ] ; 
        sumY += arr[ i + 1 ];
      }
      this.centerPoint = new Point( sumX / this.points.length , sumY / this.points.length );
    } 
   
    debugDraw()
    {
      fill( 255 ,0 , 0) ; 
      color( 255, 0 , 0 );
      ellipse( this.centerPoint.x , this.points[0].y , 25 );
    }
    draw() 
    {

      fill( 255 , 255 , 255 , 125 );
      //color( 255 , 255 , 255 , 25 );
      //blendMode(MULTIPLY);
      beginShape();
      for (let i = 0; i < this.points.length ; i++ )
      {
        //line( this.points[i - 1 ].x, this.points[i - 1 ].y , this.points[i - 1 ].x, this.points[i - 1 ].y ) ; 
        vertex( this.points[i].x, this.points[i].y );
      }
      endShape(CLOSE);
      //blendMode(NORMAL);
    }
  }
  