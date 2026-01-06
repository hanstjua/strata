import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { FunctionComponent, ReactElement } from "react";
import { StoreContext, useStore } from "./store";
import { Data } from "./components/Data";
import { Editor } from "./components/Editor";
import { Packages } from "./components/Packages";
import { Chart } from "./components/Chart";

const ErrorModal = () => {
    return (
        <div className="modal fade" id="error-modal" data-bs-keyboard="false" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Python Error</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-bg-danger p-2" style={{ borderRadius: "5px" }}>
                            <pre id="error-modal-content"></pre>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Ok</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Tab: FunctionComponent<{
    title: string
    isActive: boolean
}> = ({ title, isActive = false }) => {
    return (<li className="nav-item ms-3 mt-3" role="presentation">
        <button
            id={`${title.toLowerCase()}-tab`}
            className={isActive ? "nav-link active" : "nav-link"}
            data-bs-toggle="tab"
            data-bs-target={`#${title.toLowerCase()}`}
            aria-selected="true"
            aria-controls={title.toLowerCase()}
            role="tab"
            tabIndex={-1}>
            {title}
        </button>
    </li>)
}

const TabContent: FunctionComponent<{
    title: string
    children: ReactElement
    isActive?: boolean
    style?: Object
}> = ({ title, children, isActive = false, style = {} }) => {
    return (<div
        className={isActive ? "tab-pane fade active show" : "tab-pane fade"}
        id={title.toLowerCase()}
        role="tabpanel"
        aria-labelledby={`${title.toLowerCase()}-tab`}
        style={style}>
        {children}
    </div>)
}

const Strata: FunctionComponent<{
    isReady: boolean
}> = ({ isReady }) => {
    const [loadingMessage, setLoadingMessage] = useState('loading message');
    const store = useStore();

    useEffect(() => {
        if (!isReady) {
            const updateLoadingMessage = (e: CustomEventInit) => {
                setLoadingMessage(e.detail.message);
            }
            window.addEventListener('updateLoadingMessage', updateLoadingMessage);

            fetch(
                "/data/options"
            ).then(
                r => r.json()
            ).then(
                r => store.dispatch({
                    function: "updateTickerDataOptions",
                    arguments: {
                        availableTickers: r.tickers,
                        earliestDate: r.earliest_date,
                        latestDate: r.latest_date,
                        availableIntervals: r.intervals
                    }
                })
            );

            fetch(
                "/data/market?t=AAPL&s=2023-12-11&e=2024-12-12&i=1h"
            ).then(
                r => r.json()
            ).then(
                r => store.dispatch({
                    function: "addTickerData",
                    arguments: {
                        tickerData: {
                            uuid: crypto.randomUUID(),
                            name: "AAPL-1h",
                            ticker: "AAPL",
                            startDate: "2023-12-11",
                            endDate: "2024-12-12",
                            interval: "1h",
                            content: {
                                open: r.o,
                                high: r.h,
                                close: r.c,
                                low: r.l,
                                volume: r.v,
                                timestamp: r.t
                            }
                        }
                    }
                })
            );

            return () => {
                window.removeEventListener('updateLoadingMessage', updateLoadingMessage);
            }
        }
    }, [])

    if (!isReady) {
        return (<div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
            <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-md" aria-hidden="true"></span>
                <h2 className="ms-2 display-6">Loading ...</h2>
            </div>
            <div className="text-muted">{loadingMessage}</div>
        </div>)
    }

    const tabs = ['Editor', 'Packages', 'Data']

    return (<StoreContext.Provider value={store}>
        <ErrorModal />
        <div className="d-flex flex-column" style={{ height: "100vh" }}>
            <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Strata</a>
                </div>
            </nav>
            <div className="d-flex flex-wrap" style={{ height: "100%" }}>
                <div className="flex-grow-1 d-flex flex-column" style={{ width: "50%", height: "100%" }}>
                    <ul className="nav nav-pills" role="tablist">
                        {tabs.map((title, index) => <Tab title={title} isActive={index === 0} />)}
                    </ul>
                    <div className="tab-content flex-grow-1">
                        <TabContent title={tabs[0]} isActive={true} style={{ height: "100%" }}>
                            <Editor />
                        </TabContent>
                        <TabContent title={tabs[1]}>
                            <Packages />
                        </TabContent>
                        <TabContent title={tabs[2]} style={{ height: "100%" }}>
                            <Data />
                        </TabContent>
                    </div>
                </div>

                <div className="d-flex flex-column" style={{ width: "50%" }}>
                    <Chart />
                </div>
            </div>
        </div>
    </StoreContext.Provider>)
}

export default function App() {
    const [hasSetup, setHasSetup] = useState(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const pyReady = () => {
            setHasSetup(false);
            setIsReady(true);
            console.log('ready')
        };
        window.addEventListener('py:ready', pyReady);

        const bootstrapScript = document.createElement('script');

        bootstrapScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        bootstrapScript.integrity = "sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        bootstrapScript.crossOrigin = "anonymous"

        document.head.appendChild(bootstrapScript);

        const pyodide = document.createElement('script');

        pyodide.src = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js";

        const loadPyodide_ = async () => {
            console.log('loading pyodide');
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Loading pyodide ..." } }))
            window.pyodide = await loadPyodide();
            console.log('loaded pyodide');
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Installing micropip ..." } }))
            await window.pyodide.loadPackage('micropip')
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Loading micropip ..." } }))
            window.micropip = window.pyodide.pyimport('micropip')
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Installing pandas ..." } }))
            await window.micropip.install("pandas")
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Loading pandas ..." } }))
            await window.pyodide.runPythonAsync('print("before"); import pandas; print("ready")')
            window.dispatchEvent(new CustomEvent('updateLoadingMessage', { detail: { message: "Complete!" } }))
            setIsReady(true);
        }
        pyodide.addEventListener('load', loadPyodide_);

        document.head.appendChild(pyodide)

        return () => {
            document.head.removeChild(bootstrapScript);
            document.head.removeChild(pyodide);
            window.removeEventListener('py:ready', pyReady);
        }
    }, [hasSetup, isReady]);

    return (
        <html>
            <head>
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,AA"
                />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/darkly/bootstrap.min.css"
                    integrity="sha512-+uC0Ar9AG4/j/iF0Ug22TO9D17MAbD94K7J8h17EzXzN3D5kcOpYQdF4OuiLraHSibCVhz4DIcqwsDboRMVStg=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Rounded" rel="stylesheet" />
                <Meta />
                <Links />
            </head>
            <body>
                <Strata isReady={isReady} />

                <Outlet />

                <Scripts />
            </body>
        </html>
    );
}