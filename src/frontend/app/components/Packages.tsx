import { FunctionComponent, ReactElement, useEffect, useState } from "react";

const InstalledPackageBadge: FunctionComponent<{
    packageName: string
}> = ({ packageName }) => {
    console.log(`InstalledPackageBadge ${packageName} rendered.`)
    return (
        <span className="d-flex badge rounded-pill text-bg-success">
            <span className="m-1">{packageName}</span>
        </span>
    )
}

export const Packages = () => {
    console.log('PythonPackages rendered.')
    const [installed, setInstalled] = useState<ReactElement[]>([])

    useEffect(() => {
        const refreshPackageBadges = () => {
            const newInstalled: ReactElement[] = []
            for (let [name, packageObj] of window.micropip.list().items()) {
                newInstalled.push(<InstalledPackageBadge key={name} packageName={`${name}==${packageObj.version}`} />)
            }
            setInstalled(newInstalled)
        };
        const packageList = document.querySelector('#package-list')
        packageList!.addEventListener('refreshPackageBadges', refreshPackageBadges);
        refreshPackageBadges();
    }, [])

    const onClick = async () => {
        const packages: HTMLInputElement | null = document.querySelector('#packages')
        const packageList = document.querySelector('#package-list')

        await window.micropip.install(packages!.value.split(',').map(s => s.trim()))

        packageList!.dispatchEvent(new CustomEvent('refreshPackageBadges'));

        packages!.value = '';
    }

    return (<>
        <div id="package-list" className="px-3 pt-3 input-group">
            <div className="form-control d-flex flex-wrap gap-1">
                <input id="packages" className="flex-grow-1" type="text" placeholder="Package(s) to install (E.g. pandas, numpy==1.3.2)" style={{ borderColor: 'transparent', boxShadow: 'none', outline: 'none' }}></input>
            </div>
            <button className="btn btn-success" onClick={onClick}>Install</button>
        </div>
        <div className="px-3 pt-3 d-flex flex-wrap gap-2">{installed}</div>
    </>)
}