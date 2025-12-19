import { useContext } from "react"
import { DataItem } from "./DataItem"
import { StoreContext } from "../store";

export const Data = () => {
    console.log("Data rendered")
    const store = useContext(StoreContext);
    const dataItems = store!.models.data.tickerData.map(d => <DataItem tickerData={d} />)

    const onAddTickerData = () => {
        store!.dispatch({
            function: "addTickerData",
            arguments: {
                tickerData: {
                    uuid: crypto.randomUUID(),
                    name: "",
                    ticker: "",
                    startDate: "",
                    endDate: "",
                    interval: "",
                    content: {
                        open: [],
                        high: [],
                        close: [],
                        low: [],
                        volume: [],
                        timestamp: []
                    }
                }
            }
        });
    }

    return (<div className="d-flex flex-column gap-3 m-3">
        {dataItems}
        <div>
            <button className="btn btn-success d-flex gap-1" onClick={onAddTickerData}>
                <span className="material-symbols-rounded">add</span>
                <span>Add new data</span>
            </button>
        </div>
    </div>)
}