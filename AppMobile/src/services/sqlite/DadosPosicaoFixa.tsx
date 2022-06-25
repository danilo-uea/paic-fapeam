import db from './SQLiteDatabase';

db.transaction((tx) => {
    // tx.executeSql("DROP TABLE PosicaoFixa")

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS "
      + "PosicaoFixa "
      + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, LatitudeReceptor REAL, LongitudeReceptor REAL)"
    )
})

const update = (LatitudeReceptor:string, LongitudeReceptor:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "UPDATE PosicaoFixa SET LatitudeReceptor = ?, LongitudeReceptor = ? WHERE ID = 1", 
          [LatitudeReceptor, LongitudeReceptor],
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

const insert = (LatitudeReceptor:string, LongitudeReceptor:string) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (tx) => {
          await tx.executeSql(
            "INSERT INTO PosicaoFixa (LatitudeReceptor, LongitudeReceptor) VALUES (?,?)", 
            [LatitudeReceptor, LongitudeReceptor],
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

const get = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "SELECT ID, LatitudeReceptor, LongitudeReceptor FROM PosicaoFixa WHERE ID = 1", [],
          (tx, results) => {
            let len = results.rows.length;
            if (len > 0) {
              resolve({ 
                id: results.rows.item(0).ID,
                latitudeReceptor: results.rows.item(0).LatitudeReceptor,
                longitudeReceptor: results.rows.item(0).LongitudeReceptor })
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

export default {
  update,
  insert,
  get
}