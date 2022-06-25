const radians = (deg: number) => {
  return deg * (Math.PI / 180);
}

const calculo = (latitudeTransmissor: number, longitudeTransmissor: number, latitudeReceptor: number, longitudeReceptor: number) => {
  var R = 6373.0 * 1000;

  var lat1 = radians(latitudeTransmissor);
  var lon1 = radians(longitudeTransmissor);
  var lat2 = radians(latitudeReceptor);
  var lon2 = radians(longitudeReceptor);

  var dlon = lon2 - lon1;
  var dlat = lat2 - lat1;

  var a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  var retorno = R * c

  return retorno.toFixed(2).toString()
}

export default {
  calculo
}