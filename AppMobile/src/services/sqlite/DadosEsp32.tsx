import db from './SQLiteDatabase';

db.transaction((tx) => {
    // tx.executeSql("DROP TABLE Bluetooth")

    tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "
        + "Bluetooth "
        + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Contador INTEGER, DataHora DATETIME, Fe INTEGER, Rssi INTEGER, Tamanho INTEGER, Latitude REAL, Longitude REAL)"
    )
})

const create = (Contador:string, DataHora:string, Fe:string, Rssi:string, Tamanho:string, Latitude:string, Longitude:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO Bluetooth (Contador, DataHora, Fe, Rssi, Tamanho, Latitude, Longitude) VALUES (?,?,?,?,?,?,?)", [Contador, DataHora, Fe, Rssi, Tamanho, Latitude, Longitude],
          (tx, results) => {
            resolve('Inserido com sucesso: ' + results.insertId)
          }
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
          }
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
        "SELECT ID, Contador, DataHora " + 
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
                  dataHora: item.DataHora, 
                  // fe: item.Fe,
                  // rssi: item.Rssi,
                  // tamanho: item.Tamanho,
                  // latitude: item.Latitude,
                  // longitude: item.Longitude 
                })
              }
            }
            resolve(list)
          }
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
          "SELECT ID, Contador, DataHora, Fe, Rssi, Tamanho, Latitude, Longitude FROM Bluetooth WHERE ID = ?", [Id],
          (tx, results) => {
            let len = results.rows.length;
            if (len > 0) {
              let id = results.rows.item(0).ID;
              let contador = results.rows.item(0).Contador;
              let dataHora = results.rows.item(0).DataHora;
              let fe = results.rows.item(0).Fe;
              let rssi = results.rows.item(0).Rssi;
              let tamanho = results.rows.item(0).Tamanho;
              let latitude = results.rows.item(0).Latitude;
              let longitude = results.rows.item(0).Longitude;

              resolve({ 
                id: id, 
                contador: contador, 
                dataHora: dataHora, 
                fe: fe, 
                rssi: rssi, 
                tamanho: tamanho, 
                latitude: latitude, 
                longitude: longitude })
            } else {
              resolve(null)
            }
          }
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
  formatoDataFiltro
}