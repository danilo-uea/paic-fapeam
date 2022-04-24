import db from './SQLiteDatabase';

db.transaction((tx) => {
    // tx.executeSql("DROP TABLE Users")

    tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "
        + "Users "
        + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Age INTEGER, DataInicial DATETIME)"
    )
})

const create = (Nome:string, Idade:number, DataInicial: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO Users (Name, Age, DataInicial) VALUES (?,?,?)", [Nome, Idade, DataInicial]
        )
      })
      resolve('Inserido com sucesso')
    } catch (error) {
      reject(error)
    }
  })
}

const all = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataInicial = '2022-04-22 20:14:00';
      let dataFinal = '2022-04-26 20:12:59';
      let query = 
        "SELECT ID, Name, Age, DataInicial " + 
        "FROM Users " + 
        "WHERE strftime('%Y-%m-%d %H:%M:%S', DataInicial) > strftime('%Y-%m-%d %H:%M:%S', ?) " + 
        "AND strftime('%Y-%m-%d %H:%M:%S', DataInicial) < strftime('%Y-%m-%d %H:%M:%S', ?)";

      await db.transaction(async (tx) => {
        await tx.executeSql(
          // "SELECT ID, Name, Age, DataInicial FROM Users", [],
          query, [dataInicial, dataFinal],
          (tx, results) => {
            let list = [];
            var len = results.rows.length;
            if (len > 0) {  
              for (let i = 0; i < len; i++) {
                let item = results.rows.item(i);
                list.push({ id: item.ID, name: item.Name, age: item.Age, dataInicial: item.DataInicial })
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
          "SELECT ID, Name, Age, DataInicial FROM Users WHERE ID = ?", [Id],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              var userId = results.rows.item(0).ID;
              var userName = results.rows.item(0).Name;
              var userAge = results.rows.item(0).Age;
              var userDataInicial = results.rows.item(0).DataInicial;
              resolve({ id: userId, name: userName, age: userAge, dataInicial: userDataInicial })
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

const remove = (Id:number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "DELETE FROM Users WHERE ID = ?", [Id],
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
          "DELETE FROM Users", [],
          () => { resolve('Todos foram excluídos')},
          error => { reject(error) }
        )
      })
    } catch (error) {
      reject(error)
    }
  })
}

const datas = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          // "SELECT datetime(1650665609) data;", [],
          // "SELECT strftime('%s', 'now', 'localtime') data;", [],
          "SELECT strftime('%d/%m/%Y %H:%M:%S', 'now', 'localtime') data;", [],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              resolve(results.rows.item(0).data)
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

export default {
  create,
  all,
  get,
  remove,
  removeAll,
  datas
}