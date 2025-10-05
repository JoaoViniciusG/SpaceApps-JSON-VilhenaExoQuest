# src/database/csv_to_sqlite.py
import pandas as pd
import sqlite3
import os

from sqlalchemy import create_engine

# def csv_to_sqlite():
#     engine = create_engine("sqlite:///./database.db")
#     BASE_DIR = os.path.dirname(__file__) 
#     print(BASE_DIR, "vassas")
#     CSV_PATH = os.path.join(BASE_DIR, "data.csv")

#     df = pd.read_csv(CSV_PATH)
#     df.to_sql("exoplanets", con=engine, if_exists="replace", index=False)

# TRANSFORMA OS CSV PARA O SQLITE
def csv_to_sqlite(csv_path, sqlite_path, table_name="exoplanets", primary_key=None):
  if not os.path.exists(csv_path):
    raise FileNotFoundError(f"O arquivo CSV '{csv_path}' não foi encontrado.")

  print(f"🔹 Carregando CSV '{csv_path}' ...")
  df = pd.read_csv(csv_path)

  if primary_key and primary_key not in df.columns:
    raise ValueError(f"A coluna '{primary_key}' não existe no CSV!")

  print(f"🔹 Criando banco SQLite em '{sqlite_path}' ...")
  conn = sqlite3.connect("database.db")
  cursor = conn.cursor()

  cursor.execute(f"DROP TABLE IF EXISTS {table_name};")

  columns_def = []
  for col, dtype in zip(df.columns, df.dtypes):
    if "int" in str(dtype):
      sql_type = "INTEGER"
    elif "float" in str(dtype):
      sql_type = "REAL"
    else:
      sql_type = "TEXT"

    # Define a coluna da chave primária
    if col == primary_key:
      columns_def.append(f"{col} {sql_type} PRIMARY KEY")
    else:
      columns_def.append(f"{col} {sql_type}")

  create_table_sql = f"CREATE TABLE {table_name} ({', '.join(columns_def)});"
  cursor.execute(create_table_sql)

  # Inserir os dados linha a linha
  df.to_sql(table_name, conn, if_exists="append", index=False)

  conn.commit()
  conn.close()

  print(f"✅ Banco criado com sucesso! Tabela '{table_name}' contém {len(df)} registros.")
  if primary_key:
    print(f"🔑 Chave primária definida: '{primary_key}'")

def csv_to_sqlite2(csv_path, sqlite_path, table_name="exoplanets", primary_key=None):
  if not os.path.exists(csv_path):
    raise FileNotFoundError(f"O arquivo CSV '{csv_path}' não foi encontrado.")

  print(f"🔹 Carregando CSV '{csv_path}' ...")
  df = pd.read_csv(csv_path)

  if primary_key and primary_key not in df.columns:
    raise ValueError(f"A coluna '{primary_key}' não existe no CSV!")

  print(f"🔹 Criando banco SQLite em '{sqlite_path}' ...")
  conn = sqlite3.connect("database.db")
  cursor = conn.cursor()
  
  
  


if __name__ == "__main__":
    csv_to_sqlite2("src/data/raw/data.csv", "sqlite:///./database.db")
