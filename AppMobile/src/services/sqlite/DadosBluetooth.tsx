import Distancia from '../distancia/Distancia';
import db from './SQLiteDatabase';

db.transaction((tx) => {
    // tx.executeSql("DROP TABLE Bluetooth")

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS "
      + "Bluetooth "
      + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Contador INTEGER, SateliteDataHora DATETIME, Fe INTEGER, Rssi INTEGER, Tamanho INTEGER, LatitudeEmissor REAL, LongitudeEmissor REAL, LatitudeReceptor REAL, LongitudeReceptor REAL, DataHora DATETIME)"
    )
})

const create = (Contador:string, SateliteDataHora:string, Fe:string, Rssi:string, Tamanho:string, LatitudeEmissor:string, LongitudeEmissor:string, LatitudeReceptor:string, LongitudeReceptor:string, DataHora:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO Bluetooth (Contador, SateliteDataHora, Fe, Rssi, Tamanho, LatitudeEmissor, LongitudeEmissor, LatitudeReceptor, LongitudeReceptor, DataHora) VALUES (?,?,?,?,?,?,?,?,?,?)", 
          [Contador, SateliteDataHora, Fe, Rssi, Tamanho, LatitudeEmissor, LongitudeEmissor, LatitudeReceptor, LongitudeReceptor, DataHora],
          (tx, results) => {
            resolve('Inserido com sucesso: ' + results.insertId)
          },
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error)
    }
  })
}

const countAll = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "SELECT COUNT(*) as Qtd FROM Bluetooth", [],
          (tx, results) => {
            let len = results.rows.length;

            if (len > 0) {  
              let item = results.rows.item(0).Qtd;
              resolve(item)
            } else {
              resolve(0)
            }
          },
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error);
    }
  })
}

const allDateTime = (dataInicial:string, dataFinal:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = 
        "SELECT ID, Contador, DataHora, Fe, LatitudeEmissor, LongitudeEmissor, LatitudeReceptor, LongitudeReceptor " + 
        "FROM Bluetooth " + 
        "WHERE strftime('%Y-%m-%d %H:%M:%S', DataHora) >= strftime('%Y-%m-%d %H:%M:%S', ?) " + 
        "AND strftime('%Y-%m-%d %H:%M:%S', DataHora) <= strftime('%Y-%m-%d %H:%M:%S', ?)";

      await db.transaction(async (tx) => {
        await tx.executeSql(
          query, [dataInicial, dataFinal],
          (tx, results) => {
            let list = [];
            let len = results.rows.length;
            
            if (len > 0) {  
              for (let i = 0; i < len; i++) {
                let item = results.rows.item(i);

                let dist = Distancia.calculo(
                  item.LatitudeEmissor, 
                  item.LongitudeEmissor, 
                  item.LatitudeReceptor, 
                  item.LongitudeReceptor
                )
                
                list.push({ 
                  id: item.ID, 
                  contador: item.Contador, 
                  dataHora: item.DataHora, 
                  fe: item.Fe,
                  distancia: dist
                  // rssi: item.Rssi,
                  // tamanho: item.Tamanho,
                  // latitude: item.Latitude,
                  // longitude: item.Longitude 
                })
              }
            }
            resolve(list)
          },
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error);
    }
  })
}

const listToExport = (dataInicial:string, dataFinal:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = 
        "SELECT ID, Contador, SateliteDataHora, Fe, Rssi, Tamanho, LatitudeEmissor, LongitudeEmissor, LatitudeReceptor, LongitudeReceptor, DataHora " + 
        "FROM Bluetooth " + 
        "WHERE strftime('%Y-%m-%d %H:%M:%S', DataHora) >= strftime('%Y-%m-%d %H:%M:%S', ?) " + 
        "AND strftime('%Y-%m-%d %H:%M:%S', DataHora) <= strftime('%Y-%m-%d %H:%M:%S', ?)";

      await db.transaction(async (tx) => {
        await tx.executeSql(
          query, [dataInicial, dataFinal],
          (tx, results) => {
            let list = [];
            let len = results.rows.length;
            
            if (len > 0) {  
              for (let i = 0; i < len; i++) {
                let item = results.rows.item(i);
                list.push({ 
                  id: item.ID, 
                  contador: item.Contador, 
                  sateliteDataHora: item.SateliteDataHora,
                  fe: item.Fe,
                  rssi: item.Rssi,
                  tamanho: item.Tamanho,
                  latitudeEmissor: item.LatitudeEmissor,
                  longitudeEmissor: item.LongitudeEmissor,
                  latitudeReceptor: item.LatitudeReceptor,
                  longitudeReceptor: item.LongitudeReceptor,
                  dataHora: item.DataHora
                })
              }
            }
            resolve(list)
          },
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error);
    }
  })
}

const get = (Id:number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "SELECT ID, Contador, SateliteDataHora, Fe, Rssi, Tamanho, LatitudeEmissor, LongitudeEmissor, LatitudeReceptor, LongitudeReceptor, DataHora FROM Bluetooth WHERE ID = ?", [Id],
          (tx, results) => {
            let len = results.rows.length;
            if (len > 0) {
              let dist = Distancia.calculo(
                results.rows.item(0).LatitudeEmissor, 
                results.rows.item(0).LongitudeEmissor, 
                results.rows.item(0).LatitudeReceptor, 
                results.rows.item(0).LongitudeReceptor
              )

              resolve({ 
                id: results.rows.item(0).ID, 
                contador: results.rows.item(0).Contador, 
                sateliteDataHora: results.rows.item(0).SateliteDataHora, 
                fe: results.rows.item(0).Fe, 
                rssi: results.rows.item(0).Rssi, 
                tamanho: results.rows.item(0).Tamanho, 
                latitudeEmissor: results.rows.item(0).LatitudeEmissor, 
                longitudeEmissor: results.rows.item(0).LongitudeEmissor,
                latitudeReceptor: results.rows.item(0).LatitudeReceptor,
                longitudeReceptor: results.rows.item(0).LongitudeReceptor,
                dataHora: results.rows.item(0).DataHora,
                distancia: dist })
            } else {
              resolve(null)
            }
          },
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error);
    }
  })
}

const removeId = (Id:number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "DELETE FROM Bluetooth WHERE ID = ?", [Id],
          () => { resolve('Excluído com sucesso')},
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error)
    }
  })
}

const removeAll = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "DELETE FROM Bluetooth", [],
          () => { resolve('Todos foram excluídos')},
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error)
    }
  })
}

const removeDateTime = (dataInicial:string, dataFinal:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = 
        "DELETE " + 
        "FROM Bluetooth " + 
        "WHERE strftime('%Y-%m-%d %H:%M:%S', DataHora) >= strftime('%Y-%m-%d %H:%M:%S', ?) " + 
        "AND strftime('%Y-%m-%d %H:%M:%S', DataHora) <= strftime('%Y-%m-%d %H:%M:%S', ?)";
      await db.transaction(async (tx) => {
        await tx.executeSql(
          query, [dataInicial, dataFinal],
          () => { resolve('Excluídos com sucesso')},
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error)
    }
  })
}

const zeroEsquerda = (valor: number) => {
  let retorno: string = valor.toString().padStart(2, '0');
  return retorno;
}

const formatoDataFiltro = (data: Date) => {
  let retorno =
    `${data.getFullYear()}-` +
    `${zeroEsquerda(data.getMonth() + 1)}-` +
    `${zeroEsquerda(data.getDate())} ` +
    `${zeroEsquerda(data.getHours())}:` +
    `${zeroEsquerda(data.getMinutes())}:` +
    `00`; //sempre zero segundos

  return retorno;
}

export default {
  create,
  countAll,
  allDateTime,
  get,
  removeId,
  removeDateTime,
  removeAll,
  zeroEsquerda,
  formatoDataFiltro,
  listToExport
}