import { ChangeEvent, FormEvent, useContext, useState } from "react"
import { StoreContext, TickerData } from "../store"

export const DataItem = ({ tickerData }: { tickerData: TickerData }) => {
    const store = useContext(StoreContext);
    const data = store!.models.data;

    const [state, setState] = useState({ ...tickerData });

    const tickerOptions = data.availableTickers.map(t => t === tickerData.ticker ? <option value={t} selected={true}>{t}</option> : <option value={t}>{t}</option>)
    const intervalOptions = data.availableIntervals.map(i => i === tickerData.interval ? <option value={i} selected={true}>{i}</option> : <option value={i}>{i}</option>)

    const onUpdate = async () => {
        if (state &&
            state.name &&
            state.ticker && (
                state.name !== tickerData.name ||
                state.ticker !== tickerData.ticker ||
                state.startDate !== tickerData.startDate ||
                state.endDate !== tickerData.endDate ||
                state.interval !== tickerData.interval
            )) {
            setState({ ...state, isReloading: true })

            const newData = await fetch(
                `/data/market?t=${state.ticker}&s=${state.startDate}&e=${state.endDate}&i=${state.interval}`
            ).then(r => r.json());

            await store!.dispatch({
                function: "updateTickerData",
                arguments: {
                    tickerData: {
                        ...state,
                        content: {
                            timestamp: newData.t,
                            open: newData.o,
                            high: newData.h,
                            close: newData.c,
                            low: newData.l,
                            volume: newData.v
                        }
                    }
                }
            });

            setState({ ...state, isModified: false, isReloading: false })
        }


    };

    const onDelete = () => {
        store!.dispatch({
            function: "removeTickerData",
            arguments: { uuid: tickerData.uuid }
        });
    };

    const onUpdateName = async (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, name: e.target.value });

        await store!.dispatch({
            function: "updateTickerData",
            arguments: {
                tickerData: { ...tickerData, name: e.target.value }
            }
        });
    }

    const onUpdateTicker = (e: ChangeEvent<HTMLSelectElement>) => {
        setState({ ...state, ticker: e.target.value, isModified: true });
    }

    const onUpdateStartDate = (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, startDate: e.target.value, isModified: true });
    }

    const onUpdateEndDate = (e: ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, endDate: e.target.value, isModified: true });
    }

    const onUpdateInterval = (e: ChangeEvent<HTMLSelectElement>) => {
        console.log(`new interval: ${e.target.value}`)
        setState({ ...state, interval: e.target.value, isModified: true });
    }

    const addInvalid = (isInvalid: boolean, classes: string) => isInvalid ? `${classes} is-invalid` : classes;

    return (<div className={`input-group d-flex border rounded ${state.isModified ? "border-warning border-2" : "border-0"}`}>
        <input
            className={addInvalid(state.name === "", "form-control form-control-sm")}
            type="text"
            placeholder="Data name"
            value={state.name}
            onChange={onUpdateName}></input>
        <select
            className={addInvalid(state.ticker === "", "form-select")}
            onChange={onUpdateTicker}>
            <option value="">- Select ticker -</option>
            {tickerOptions}
        </select>
        <input
            className={addInvalid(state.startDate === "", "form-control")}
            type="date"
            min={data.earliestDate}
            max={data.latestDate}
            value={state.startDate}
            onChange={onUpdateStartDate}></input>
        <span className="input-group-text">To</span>
        <input
            className={addInvalid(state.endDate === "", "form-control")}
            type="date"
            min={data.earliestDate}
            max={data.latestDate}
            value={state.endDate}
            onChange={onUpdateEndDate}></input>
        <select
            className={addInvalid(state.interval === "", "form-select form-select-sm")}
            onChange={onUpdateInterval}>
            <option value="">- Select interval -</option>
            {intervalOptions}
        </select>
        <button className={`btn btn-sm ${state.isModified ? "btn-warning" : "btn-secondary disabled"} ${state.isReloading ? "disabled" : ""}`} type="button" onClick={onUpdate}>
            <span className="material-symbols-rounded">{state.isReloading ? "" : "refresh"}</span>
            <div className={state.isReloading ? "spinner-border spinner-border-sm": ""}></div>
        </button>
        <button className="btn btn-sm btn-danger" type="button" onClick={onDelete}>
            <span className="material-symbols-rounded">delete</span>
        </button>
    </div>)
}