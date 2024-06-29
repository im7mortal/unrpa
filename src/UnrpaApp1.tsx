import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import {DefaultExternalLoggerFunc, LogProvider} from "./LogProvider";
import {LogLevel} from "./logInterface";
import Logs from "./Logs";
import UnrpaApp from "./UnrpaApp";
import {SpinnerProvider} from "./spinnerContext";
import {FilesProvider} from "./DropdownFilesContext";
import {ApiInfoProvider, defaultApiInfo} from "./ContextAPI";
import Drop from "./ElementFileDrop";

function UnrpaApp1() {
    return (
        <div className={`container text-center `}>
            <LogProvider loggers={[
                {logFunction: DefaultExternalLoggerFunc, logLevel: LogLevel.Error},
                {logFunction: console.log, logLevel: LogLevel.Debug}
            ]}>
                <FilesProvider>
                    <ApiInfoProvider value={defaultApiInfo}>
                        <SpinnerProvider>
                            <Drop/>
                            <UnrpaApp/>
                            <Logs/>
                        </SpinnerProvider>
                    </ApiInfoProvider>
                </FilesProvider>
            </LogProvider>
        </div>);
}

export default UnrpaApp1;
