import { FunctionComponent, useContext } from "react";
import { CodeInput } from "./CodeInput";
import { StoreContext } from "../store";

class MissingOutputError extends Error {
    constructor(message: string) {
        super(message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, MissingOutputError.prototype);

        this.name = "MissingOutputError"
        this.message = message
    }
}

export const Editor: FunctionComponent = () => {
    const store = useContext(StoreContext);

    const onRun = async () => {
        const body = document.querySelector('body')

        try {
            const INPUT = window.pyodide.runPython(
                'import pandas as pd; INPUT = {name: pd.DataFrame(data) for name, data in _input.to_py().items()}; INPUT',
                {
                    locals: new Map([
                        ['_input', new Map(store!.models.data.tickerData.map(t => [t.name, t.content]))]
                    ])
                }
            )
            const locals = new Map([['INPUT', INPUT]])
            window.pyodide.runPython(window.editorView.state.doc.toString(), { locals: locals });
            const result = window.pyodide.runPython(
                'from pyodide.ffi import to_js; import js; to_js(OUTPUT.to_dict(orient="list"), dict_converter=js.Object.fromEntries)',
                { locals: locals }
            )

            if (!locals.has('OUTPUT')) {
                throw new MissingOutputError('OUTPUT variable not found.\nMake sure your Python code assigns a DataFrame object to a variable named OUTPUT.');
            }

            window.dispatchEvent(new CustomEvent('updateChart', { detail: { data: result } }))

        } catch (e) {
            const errorModal = window.bootstrap.Modal.getOrCreateInstance(document.querySelector('#error-modal'))
            const content = document.querySelector('#error-modal-content')

            content.innerText = e;
            errorModal.toggle();
        }
    }

    return (<div className="d-flex flex-column" style={{ height: "100%" }}>
        <CodeInput defaultCode={pyCode} />
        <div className="mx-3 mb-3">
            <button className="btn btn-secondary d-flex gap-1" id="py-button" onClick={onRun}>
                <span className="material-symbols-rounded">play_arrow</span>
                <span>Run</span>
            </button>
        </div>
    </div>)
}

const pyCode = `import pandas as pd
import numpy as np

transac_cost = 0.05

# SMA strategy
short_sma_period = 20
long_sma_period = 40

sma_data = INPUT['AAPL-1h'].copy().dropna()
sma_data['returns'] = np.log(sma_data['close'] / sma_data['close'].shift(1))
sma_data['sma_short'] = sma_data['close'].rolling(short_sma_period).mean()
sma_data['sma_long'] = sma_data['close'].rolling(long_sma_period).mean()
sma_data['position'] = np.where(sma_data['sma_short'] > sma_data['sma_long'], 1, -1)
sma_data['strategy'] = sma_data['position'].shift(1) * sma_data['returns']
sma_data.dropna(inplace=True)

trades = sma_data['position'].diff().fillna(0) != 0
sma_data['strategy'][trades] -= transac_cost

# Momentum strategy
momentum_period = 10

mom_data = INPUT['AAPL-1h'].copy().dropna()
mom_data['returns'] = np.log(mom_data['close'] / mom_data['close'].shift(1))
mom_data['position'] = np.sign(mom_data['returns'].rolling(momentum_period).mean())
mom_data['strategy'] = mom_data['position'].shift(1) * mom_data['returns']
mom_data.dropna(inplace=True)

trades = mom_data['position'].diff().fillna(0) != 0
mom_data['strategy'][trades] -= transac_cost

base_values = INPUT['AAPL-1h']['close']

OUTPUT = pd.DataFrame({
  'BaseReturns': sma_data['returns'].cumsum().apply(np.exp) * base_values,
  'Sma': sma_data['strategy'].cumsum().apply(np.exp) * base_values,
  'Momentum': mom_data['strategy'].cumsum().apply(np.exp) * base_values
})
`;