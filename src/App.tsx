import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GitHubButton from 'react-github-btn'
import {LogProvider, DefaultExternalLoggerFunc} from './LogProvider';
import {LogLevel} from './logInterface';
import Logs from './Logs';
// import MyDropzone from "./MyDropzone";
import {SpinnerProvider} from "./spinnerContext";
import UnrpaApp from "./UnrpaApp";

function App() {
    return (
        <>

            {/*<div id="overlay"*/}
            {/*     style="display: none; position: fixed; top: 0; left: 0; height: 100%; width: 100%; background-color: rgba(0,0,0, 0.5);">*/}
            {/*  <p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 2em;">Drop*/}
            {/*    Files Here</p>*/}
            {/*</div>*/}
            <div className="row mr-2 mt-2">
                <div className="col-10 text-left">
                    ITWILLBEREPLACEDWITHVERSION
                </div>

                <div className="col-2 text-right">
                    <GitHubButton href="https://github.com/im7mortal/unrpa"
                                  data-color-scheme="no-preference: light; light: light; dark: dark;"
                                  data-icon="octicon-star" data-size="large"
                                  aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
                    <GitHubButton href="https://github.com/im7mortal/unrpa/issues"
                                  data-color-scheme="no-preference: light; light: light; dark: dark;"
                                  data-icon="octicon-issue-opened" data-size="large"
                                  aria-label="Issue buttons/github-buttons on GitHub">Issue</GitHubButton>
                </div>
            </div>


            <h1 className="display-1 text-center">UNRPA - Extract Ren'Py Archives</h1>

            <div className="container text-center">

                <LogProvider loggers={[
                    {logFunction: DefaultExternalLoggerFunc, logLevel: LogLevel.Error},
                    {logFunction: console.log, logLevel: LogLevel.Debug}
                ]}>

                    <SpinnerProvider>
                        <UnrpaApp/>
                        <Logs/>
                    </SpinnerProvider>
                </LogProvider>

                {/*<div style={{maxWidth: '600px', margin: '0 auto'}}>*/}
                {/*    <MyDropzone/>*/}
                {/*</div>*/}
                {/*<div className="row">
            <div className="col">
              <div id="Firefox" className="container">
                <input type="file" id="fileInput" />
                <button id="filePick2" className="button-blue" >Select Archive</button>
                <button id="startD"  disabled>Extract</button>
              </div>
            </div>
          </div>*/}

                {/*<div className="row">
            <div className="col">
              <div id="mobile"   className="container">
                Mobile platforms are not supported.
              </div>
            </div>
          </div>*/}


            </div>


        </>
    );
}

export default App;
