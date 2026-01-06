import datetime
import os
import dotenv
import pyarrow.dataset as ds
import pyarrow.parquet as pq

from fastapi import FastAPI

dotenv.load_dotenv()

required_env_vars = set([
    'FILESYSTEM',
])
available_env_vars = set(os.environ)

if required_env_vars.difference(available_env_vars):
    raise ValueError(f'Missing required environment variables: {required_env_vars.difference(available_env_vars)}')

app = FastAPI()

@app.middleware("http")
def origin_check():
    pass

@app.get('/health')
def get_health():
    return {'status': 'ok'}

@app.get("/data/options")
def get_options():
    dataset = ds.dataset('canonical/bars_1d', filesystem=os.environ['FILESYSTEM'], format='parquet')
    tickers = dataset.to_table(columns=['symbol']).column('symbol').unique().to_pylist()

    pfile = pq.ParquetFile([f for f in dataset.get_fragments()][-1].path, filesystem=os.environ['FILESYSTEM'])
    metadata = pfile.metadata

    return {
        "tickers": tickers,
        "earliest_date": metadata.row_group(0).column(6).statistics.min.strftime('%Y-%m-%d'),
        "latest_date": metadata.row_group(metadata.num_row_groups - 1).column(6).statistics.max.strftime('%Y-%m-%d'),
        "intervals": ["1m", "2m", "5m", "15m", "30m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]
    }

@app.get("/data/market")
def get_market_data(t: str, s: str, e: str, i: str):
    data_type = 'canonical' if i in ('1m', '1d') else 'derived'
    dataset = ds.dataset(f'{data_type}/bars_{i}', filesystem=os.environ['FILESYSTEM'], format='parquet')
    start = datetime.datetime.strptime(s, '%Y-%m-%d')
    end = datetime.datetime.strptime(e, '%Y-%m-%d')

    table = dataset.to_table(
        columns=['t', 'o', 'h', 'l', 'c', 'v'],
        filter=(ds.field('t') >= start) & (ds.field('t') <= end) & (ds.field('symbol') == t)
    )

    return table.to_pydict()
