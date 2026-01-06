# Strata

A convenient backtesting app for quickly developing and testing trading strategies.

Strata provides tools to run historical simulations of trading strategies against market data, calculate performance metrics, and help you refine trading ideas before deploying them live.

Try it [here](https://hanstjua.work/strata/index.html)!

---

## Features

- **Run Python in Browser** – Implement your ideas in Python and run them directly in your browser.
- **Install Python Packages** – You can install your favourite (pyodide-supported) Python package(s).
- **Access Historical OHLCV** – Historical OHLCV data for 400+ stocks are available in different frequencies.

---

## Getting Started

### Editor

You can implement your strategy through the Python editor.

OHLCV data is accessible via the `INPUT` variable. You can access the data by name. (e.g. `INPUT['AAPL-1h']`, `INPUT['MSFT-1d']`, etc.)

The OHLCV data are `DateTimeIndex`-indexed `DataFrame` objects.

At the end of your code, you **MUST** assign a `DataFrame` object to a variable named `OUTPUT`.

The content of the `DataFrame` object will be displayed in the OUTPUT chart.

### Packages

You can install Python packages, as long as they are supported by `pyodide`.

To install a package you can either do `your-package` or `your-package==1.2.3`.

### Data

You can specify which OHLCV data you want access to.

Each OHLCV data should have a **name** (which you will use to access the data in your code), **symbol**, **start date**, **end date**, and **interval** (or frequency).

---

## Ideas for Future Enhancements

1. Include market data other than OHLCV.
2. Include market data for other asset classes.
3. Add a display for STDOUT.
4. Allow users to input their own data/sources.
5. Support multiple charts display.
