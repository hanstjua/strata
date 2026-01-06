import { EditorView } from "codemirror";
import { createContext, useState } from "react";

export interface TickerData {
    uuid: string
    name: string
    ticker: string
    startDate: string
    endDate: string
    interval: string
    content: {
        timestamp: bigint[]
        open: number[]
        high: number[]
        close: number[]
        low: number[]
        volume: bigint[]
    }
    isModified: boolean
    isReloading: boolean
};

export interface Data {
    tickerData: TickerData[]
    availableTickers: string[]
    earliestDate: string
    latestDate: string
    availableIntervals: string[]
}

export interface Package {
    name: string
    version: string
};

export interface Editor {
    editorView: EditorView | null
    isExecuting: boolean
}

export interface Models {
    editor: Editor
    packages: Package[]
    data: Data
};

export interface StoreAction {
    function: string
    arguments: Object
}

export class Store {
    models: Models
    dispatch: (action: StoreAction) => any

    constructor({ models, dispatch }: {
        models: Models,
        dispatch: (action: StoreAction) => any
    }) {
        this.models = models;
        this.dispatch = dispatch;
    }
};

export const useStore = () => {
    const [packages, setPackages] = useState<Package[]>([])
    const [data, setData] = useState<Data>({
        tickerData: [],
        availableTickers: [],
        earliestDate: "",
        latestDate: "",
        availableIntervals: []
    })
    const [editor, setEditor] = useState<Editor>({
        editorView: null,
        isExecuting: false
    });

    const functions = {
        addPackage: ({ package_ }: any) => {
            packages.push(package_);
            setPackages(packages);
        },
        addTickerData: async ({ tickerData }: any) => {
            const newTickerData = data.tickerData;
            newTickerData.push(tickerData)
            setData({ ...data, tickerData: newTickerData });
        },
        removeTickerData: ({ uuid }: any) => {
            data!.tickerData = data!.tickerData.filter(d => d.uuid !== uuid)
            setData({ ...data });
        },
        updateTickerData: async ({ tickerData }: any) => {
            const i = data!.tickerData.indexOf(data!.tickerData.find(t => t.uuid === tickerData.uuid)!);
            data!.tickerData[i] = tickerData;

            setData({ ...data });
        },
        updateTickerDataOptions: ({
            availableTickers,
            earliestDate,
            latestDate,
            availableIntervals
        }: any) => {
            data!.availableTickers = availableTickers;
            data!.earliestDate = earliestDate;
            data!.latestDate = latestDate;
            data!.availableIntervals = availableIntervals;
            setData({ ...data });
        },
        executeCode: async ({}) => {
            setEditor({ ...editor, isExecuting: true });
        },
        completeCodeExecution: async ({}) => {
            setEditor({ ...editor, isExecuting: false });
        }
    };

    const dispatch = (action: StoreAction) => {
        return functions[action.function as keyof typeof functions](action.arguments)
    }

    return new Store({
        models: {
            packages: packages,
            data: data,
            editor: editor
        },
        dispatch: dispatch
    })
};

export const StoreContext = createContext<Store | null>(null);
