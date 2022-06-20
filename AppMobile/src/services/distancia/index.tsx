function radians(deg: number){
    return deg * (Math.PI / 180);
  }
  
  function Distancia(lat: number, lon: number){
    var R = 6373.0 * 1000;
    
    var lat1 = radians(lat);
    var lon1 = radians(lon);
    var lat2 = radians(-3.124978201975564);
    var lon2 = radians(-59.97085089333622);
    
    var dlon = lon2 - lon1;
    var dlat = lat2 - lat1;
    
    var a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c
  }
  
  console.log(Distancia(-3.120859604129972, -59.97887408961077))