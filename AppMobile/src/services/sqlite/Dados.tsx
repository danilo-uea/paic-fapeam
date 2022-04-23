import db from './SQLiteDatabase';

db.transaction((tx) => {
    // tx.executeSql("DROP TABLE Users")

    tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "
        + "Users "
        + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Age INTEGER)"
    )
})

const create = (Nome:string, Idade:number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO Users (Name, Age) VALUES (?,?)", [Nome, Idade]
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
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "SELECT ID, Name, Age FROM Users", [],
          (tx, results) => {
            let list = [];
            var len = results.rows.length;
            if (len > 0) {  
              for (let i = 0; i < len; i++) {
                let item = results.rows.item(i);
                list.push({ id: item.ID, name: item.Name, age: item.Age })
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
          "SELECT ID, Name, Age FROM Users WHERE ID = ?", [Id],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              var userId = results.rows.item(0).ID;
              var userName = results.rows.item(0).Name;
              var userAge = results.rows.item(0).Age;
              resolve({ id: userId, name: userName, age: userAge })
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

export default {
  create,
  all,
  get,
  remove,
  removeAll
}