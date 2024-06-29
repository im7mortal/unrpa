import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import {DefaultExternalLoggerFunc, ContextLog} from "./ContextLog";
import {LogLevel} from "./logInterface";
import ElementLogs from "./ElementLogs";
import UnrpaApp from "./UnrpaApp";
import {SpinnerProvider} from "./ContextSpinner";
import {FilesProvider} from "./ContextDropdownFiles";
import {ApiInfoProvider, defaultApiInfo} from "./ContextAPI";
import Drop from "./ElementFileDrop";

function UnrpaApp1() {
    return (
        <div className={`container text-center `}>
            <ContextLog loggers={[
                {logFunction: DefaultExternalLoggerFunc, logLevel: LogLevel.Error},
                {logFunction: console.log, logLevel: LogLevel.Debug}
            ]}>
                <FilesProvider>
                    <ApiInfoProvider value={defaultApiInfo}>
                        <SpinnerProvider>
                            <Drop/>
                            <UnrpaApp/>
                            <ElementLogs/>
                        </SpinnerProvider>
                    </ApiInfoProvider>
                </FilesProvider>
            </ContextLog>
        </div>);
}

export default UnrpaApp1;
